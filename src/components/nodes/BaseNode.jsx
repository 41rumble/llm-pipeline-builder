import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ data, isConnectable }) => {
  const hasInputs = data.type !== 'input';
  const hasOutputs = data.type !== 'output';

  return (
    <div className={`node-container node-${data.type}`}>
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
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
        />
      )}
    </div>
  );
};

export default memo(BaseNode);