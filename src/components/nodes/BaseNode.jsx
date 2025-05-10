import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ data, isConnectable }) => {
  const hasInputs = data.type !== 'input';
  const hasOutputs = data.type !== 'output';

  return (
    <div className="node-container" style={{ 
      background: '#f5f5f5', 
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '10px',
      width: '200px'
    }}>
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}
      
      <div className="node-header" style={{ 
        borderBottom: '1px solid #ddd',
        marginBottom: '8px',
        paddingBottom: '5px'
      }}>
        <div style={{ fontWeight: 'bold' }}>{data.label}</div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>{data.type}</div>
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
            <div key={key} className="node-param" style={{ fontSize: '0.9em', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>{key}:</span> {displayValue}
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