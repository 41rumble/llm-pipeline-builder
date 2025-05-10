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
          <svg className="app-logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4285f4" />
            <path d="M2 17L12 22L22 17" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="app-logo-text">LLM Pipeline Builder</span>
        </div>
        <div className="app-header-actions">
          <button 
            onClick={() => setShowExecutionPanel(!showExecutionPanel)}
            className="action-button"
            style={{ 
              backgroundColor: showExecutionPanel ? '#34344a' : '#4285f4',
              color: '#e0e0e0'
            }}
          >
            {showExecutionPanel ? 'Hide Execution Panel' : 'Show Execution Panel'}
          </button>
        </div>
      </header>
      
      <div className="app-content" style={{ display: 'flex', flex: 1, width: '100%', height: 'calc(100vh - 72px)' }}>
        <div className="flow-container" style={{ flex: showExecutionPanel ? '70%' : '100%', width: showExecutionPanel ? '70%' : '100%' }}>
          <FlowCanvas onExecute={handleExecutePipeline} />
        </div>
        
        {showExecutionPanel && (
          <div className="execution-panel">
            <div className="execution-panel-header">
              <h2 className="execution-panel-title">Pipeline Execution</h2>
              <button 
                className="execution-panel-close"
                onClick={() => setShowExecutionPanel(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0a0b0' }}
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
                  className="action-button action-button-execute"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isExecuting ? (
                    <>
                      <span className="execution-spinner-small" style={{ 
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        borderTopColor: 'white',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></span>
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
                  <div className="no-result" style={{ color: '#a0a0b0', textAlign: 'center', padding: '20px' }}>
                    <p>No results yet. Execute the pipeline to see results.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="status-bar" style={{ 
        height: '24px', 
        backgroundColor: '#2d2d3a', 
        borderTop: '1px solid #3f3f5c',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontSize: '12px',
        color: '#a0a0b0'
      }}>
        <div className="status-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%',
            backgroundColor: isExecuting ? '#f59e0b' : '#10b981'
          }}></div>
          <span>{isExecuting ? 'Executing pipeline...' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;