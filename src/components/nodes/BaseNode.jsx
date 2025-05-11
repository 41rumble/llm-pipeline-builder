import { memo, useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

// Custom node component with dark theme styling
const BaseNode = ({ id, data, isConnectable, selected }) => {
  const hasInputs = data.type !== 'input';
  const hasOutputs = data.type !== 'output';
  const { getNodes } = useReactFlow();
  const [showOutput, setShowOutput] = useState(false);
  const [nodeOutput, setNodeOutput] = useState(null);
  
  // Check if this node is currently executing
  const isExecuting = window.executingNodeId === id;
  
  // Apply custom styling to remove the white background
  const nodeStyle = {
    background: 'transparent', // Make the node background transparent
    border: 'none',            // Remove any border
    padding: 0,                // Remove padding
    borderRadius: 0,           // Remove border radius
    width: '100%'              // Ensure full width
  };

  // Check for node output in window.pipelineResults
  useEffect(() => {
    // Initial check for existing results
    if (window.pipelineResults && window.pipelineResults[id]) {
      setNodeOutput(window.pipelineResults[id]);
    }
    
    // Listen for node result events
    const handleNodeResult = (event) => {
      if (event.detail.nodeId === id) {
        setNodeOutput(event.detail.result);
      }
    };
    
    // Listen for pipeline results updated event
    const handlePipelineResults = (event) => {
      if (event.detail.results && event.detail.results[id]) {
        setNodeOutput(event.detail.results[id]);
      }
    };
    
    // Add event listeners
    window.addEventListener('nodeResultAvailable', handleNodeResult);
    window.addEventListener('pipelineResultsUpdated', handlePipelineResults);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('nodeResultAvailable', handleNodeResult);
      window.removeEventListener('pipelineResultsUpdated', handlePipelineResults);
    };
  }, [id]);

  // Toggle output display
  const toggleOutput = (e) => {
    e.stopPropagation();
    setShowOutput(!showOutput);
  };

  return (
    <div style={nodeStyle}>
      <div 
        className={`node-container node-${data.type} ${isExecuting ? 'node-executing' : ''}`}>
        {hasInputs && (
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ 
              top: -4,
              width: 8,
              height: 8,
              background: '#3f3f5c',
              border: '2px solid #6e6e8e'
            }}
          />
        )}
        
        <div className="node-header">
          <h4 className="node-title">{data.label}</h4>
          <div className="node-subtitle">{data.type}</div>
        </div>
        
        <div className="node-content">
          {Object.entries(data.params).map(([key, value]) => {
            // Don't display complex objects, just indicate they exist
            const displayValue = typeof value === 'object' 
              ? `[${key} config]` 
              : String(value).length > 20 
                ? `${String(value).substring(0, 20)}...` 
                : value;
                
            return (
              <div key={key} className="node-param">
                <span className="node-param-label">{key}:</span>
                <span className="node-param-value">{displayValue}</span>
              </div>
            );
          })}
          
          {/* Output button - only show if we have results */}
          {nodeOutput && (
            <div className="node-output-controls">
              <button 
                className="node-output-toggle" 
                onClick={toggleOutput}
              >
                {showOutput ? 'Hide Output' : 'Show Output'}
              </button>
            </div>
          )}
          
          {/* Output display */}
          {showOutput && nodeOutput && (
            <div className="node-output-display">
              <div className="node-output-content">
                {Array.isArray(nodeOutput) ? (
                  <div>
                    <div className="node-output-array-info">Array with {nodeOutput.length} items:</div>
                    {nodeOutput.map((item, index) => (
                      <div key={index} className="node-output-array-item">
                        <div className="node-output-array-index">{index + 1}:</div>
                        <div className="node-output-array-value">
                          {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="node-output-text">
                    {typeof nodeOutput === 'object' ? JSON.stringify(nodeOutput, null, 2) : String(nodeOutput)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {hasOutputs && (
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{ 
              bottom: -4,
              width: 8,
              height: 8,
              background: '#3f3f5c',
              border: '2px solid #6e6e8e'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default memo(BaseNode);