import { memo } from 'react';
import { Handle, Position } from 'reactflow';

// Custom node component with dark theme styling
const BaseNode = ({ data, isConnectable }) => {
  const hasInputs = data.type !== 'input';
  const hasOutputs = data.type !== 'output';

  // Apply custom styling to remove the white background
  const nodeStyle = {
    background: 'transparent', // Make the node background transparent
    border: 'none',            // Remove any border
    padding: 0,                // Remove padding
    borderRadius: 0,           // Remove border radius
    width: '100%'              // Ensure full width
  };

  return (
    <div style={nodeStyle}>
      <div className={`node-container node-${data.type}`}>
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