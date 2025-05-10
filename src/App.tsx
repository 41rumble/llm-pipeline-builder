import { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import { Pipeline } from './utils/exportUtils';
import { PipelineExecutor } from './engine/pipelineExecutor';
import { registerHandlebarsHelpers } from './utils/handlebarsHelpers';
import './App.css';

// Register Handlebars helpers
registerHandlebarsHelpers();

function App() {
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState('');
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);

  // Handle pipeline execution
  const handleExecutePipeline = async (pipeline: Pipeline) => {
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
        <h1>LLM Pipeline Builder</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowExecutionPanel(!showExecutionPanel)}
            className="execution-toggle-button"
          >
            {showExecutionPanel ? 'Hide Execution Panel' : 'Show Execution Panel'}
          </button>
        </div>
      </header>
      
      <div className="app-content" style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        <div className="flow-container" style={{ flex: showExecutionPanel ? '70%' : '100%' }}>
          <FlowCanvas onExecute={handleExecutePipeline} />
        </div>
        
        {showExecutionPanel && (
          <div className="execution-panel" style={{ 
            flex: '30%', 
            padding: '20px',
            borderLeft: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2>Pipeline Execution</h2>
            
            <div className="input-section" style={{ marginBottom: '20px' }}>
              <label htmlFor="execution-input" style={{ display: 'block', marginBottom: '8px' }}>
                Input:
              </label>
              <textarea
                id="execution-input"
                value={executionInput}
                onChange={(e) => setExecutionInput(e.target.value)}
                placeholder="Enter input for the pipeline..."
                style={{ 
                  width: '100%', 
                  height: '100px', 
                  padding: '8px',
                  marginBottom: '10px'
                }}
              />
              <button
                onClick={() => {
                  const flowCanvas = document.querySelector('.react-flow') as any;
                  if (flowCanvas && flowCanvas.__reactFlowInstance) {
                    const pipeline = {
                      nodes: flowCanvas.__reactFlowInstance.getNodes().map((node: any) => ({
                        id: node.id,
                        type: node.data.type,
                        params: node.data.params
                      })),
                      edges: flowCanvas.__reactFlowInstance.getEdges().map((edge: any) => ({
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle
                      }))
                    };
                    handleExecutePipeline(pipeline);
                  }
                }}
                disabled={isExecuting}
                style={{ 
                  padding: '8px 16px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isExecuting ? 'not-allowed' : 'pointer'
                }}
              >
                {isExecuting ? 'Executing...' : 'Execute Pipeline'}
              </button>
            </div>
            
            <div className="result-section" style={{ flex: 1, overflow: 'auto' }}>
              <h3>Result:</h3>
              {isExecuting ? (
                <div className="loading">Executing pipeline...</div>
              ) : executionResult ? (
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '500px'
                }}>
                  {typeof executionResult === 'object' 
                    ? JSON.stringify(executionResult, null, 2) 
                    : executionResult}
                </pre>
              ) : (
                <div className="no-result">No results yet. Execute the pipeline to see results.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
