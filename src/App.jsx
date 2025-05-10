import { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import { PipelineExecutor } from './engine/pipelineExecutor';
import { registerHandlebarsHelpers } from './utils/handlebarsHelpers';
import './styles/theme.css';
import './styles/layout.css';
import './styles/flow.css';

// Register Handlebars helpers
registerHandlebarsHelpers();

function App() {
  const [executionResult, setExecutionResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState('');
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);

  // Handle pipeline execution
  const handleExecutePipeline = async (pipeline) => {
    setIsExecuting(true);
    setExecutionResult(null);
    
    try {
      const executor = new PipelineExecutor(pipeline);
      const result = await executor.execute(executionInput);
      setExecutionResult(result);
    } catch (error) {
      console.error('Pipeline execution failed:', error);
      setExecutionResult({
        error: error instanceof Error ? error.message : 'Unknown error during execution'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">
          <svg className="app-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3A86FF" />
            <path d="M2 17L12 22L22 17" stroke="#3A86FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#3A86FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="app-logo-text">LLM Pipeline Builder</span>
        </div>
        <div className="app-header-actions">
          <button 
            onClick={() => setShowExecutionPanel(!showExecutionPanel)}
            className={`btn ${showExecutionPanel ? 'btn-outline' : 'btn-primary'}`}
          >
            {showExecutionPanel ? 'Hide Execution Panel' : 'Show Execution Panel'}
          </button>
        </div>
      </header>
      
      <div className="app-content">
        <div className="flow-container" style={{ flex: showExecutionPanel ? '70%' : '100%' }}>
          <FlowCanvas onExecute={handleExecutePipeline} />
        </div>
        
        {showExecutionPanel && (
          <div className="execution-panel">
            <div className="execution-panel-header">
              <h2 className="execution-panel-title">Pipeline Execution</h2>
              <button 
                className="execution-panel-close btn-ghost"
                onClick={() => setShowExecutionPanel(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            
            <div className="execution-panel-content">
              <div className="execution-panel-section">
                <h3 className="execution-panel-section-title">Input</h3>
                <div className="form-group">
                  <label htmlFor="execution-input" className="form-label">
                    Enter text to process through the pipeline:
                  </label>
                  <textarea
                    id="execution-input"
                    className="form-control"
                    value={executionInput}
                    onChange={(e) => setExecutionInput(e.target.value)}
                    placeholder="Enter input for the pipeline..."
                    rows={5}
                  />
                </div>
                <button
                  onClick={() => {
                    // The Execute button in the FlowCanvas component will handle this
                    const executeButton = document.querySelector('.execute-pipeline-button');
                    if (executeButton) {
                      executeButton.click();
                    }
                  }}
                  disabled={isExecuting}
                  className={`btn ${isExecuting ? 'btn-outline' : 'btn-primary'}`}
                >
                  {isExecuting ? (
                    <>
                      <span className="execution-spinner-small"></span>
                      Executing...
                    </>
                  ) : (
                    'Execute Pipeline'
                  )}
                </button>
              </div>
              
              <div className="execution-panel-section">
                <h3 className="execution-panel-section-title">Result</h3>
                {isExecuting ? (
                  <div className="execution-loading">
                    <div className="execution-spinner"></div>
                    <p>Processing pipeline...</p>
                  </div>
                ) : executionResult ? (
                  <div className="execution-result">
                    <pre>
                      {typeof executionResult === 'object' 
                        ? JSON.stringify(executionResult, null, 2) 
                        : executionResult}
                    </pre>
                  </div>
                ) : (
                  <div className="no-result">
                    <p>No results yet. Execute the pipeline to see results.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="status-bar">
        <div className="status-item">
          <div className={`status-indicator ${isExecuting ? 'status-indicator-warning' : 'status-indicator-success'}`}></div>
          <span>{isExecuting ? 'Executing pipeline...' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;