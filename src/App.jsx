import { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import { PipelineExecutor } from './engine/pipelineExecutor';
import { registerHandlebarsHelpers } from './utils/handlebarsHelpers';
import DebugPanel from './components/DebugPanel';
import './styles/dark-theme.css';

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
      // Create a pipeline executor
      const executor = new PipelineExecutor(pipeline);
      
      // Execute the pipeline with the input
      const result = await executor.execute(executionInput);
      
      // Set the result
      setExecutionResult(result);
      
      return result;
    } catch (error) {
      console.error('Pipeline execution error:', error);
      setExecutionResult(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">
          <svg className="app-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4285f4" />
            <path d="M2 17L12 22L22 17" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="flow-container">
          <FlowCanvas onExecute={handleExecutePipeline} />
        </div>
        
        {showExecutionPanel && (
          <div className="execution-panel">
            <div className="execution-panel-header">
              <h2 className="execution-panel-title">Pipeline Execution</h2>
              <button 
                className="btn btn-outline"
                onClick={() => setShowExecutionPanel(false)}
                style={{ padding: '4px 8px' }}
              >
                X
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
                  {isExecuting ? 'Executing...' : 'Execute Pipeline'}
                </button>
              </div>
              
              <div className="execution-panel-section">
                <h3 className="execution-panel-section-title">Result</h3>
                {isExecuting ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#a0a0b0' }}>
                    <div className="execution-spinner"></div>
                    Executing pipeline...
                  </div>
                ) : executionResult ? (
                  <div className="execution-result-container">
                    <pre className="execution-result-content">
                      {typeof executionResult === 'object' 
                        ? JSON.stringify(executionResult, null, 2) 
                        : executionResult}
                    </pre>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#a0a0b0' }}>
                    No results yet. Execute the pipeline to see results.
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
      
      {/* Add the debug panel */}
      {import.meta.env.DEV && <DebugPanel />}
    </div>
  );
}

export default App;