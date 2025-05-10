import { useState, useEffect } from 'react';
import nodeRegistry from '../utils/nodeRegistry';

const NodeConfigPanel = ({ selectedNode, onUpdateNode, onClose }) => {
  const [nodeData, setNodeData] = useState(null);

  useEffect(() => {
    if (selectedNode) {
      setNodeData({ ...selectedNode });
    } else {
      setNodeData(null);
    }
  }, [selectedNode]);

  if (!nodeData) {
    return null;
  }

  const handleChange = (key, value) => {
    setNodeData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        params: {
          ...prev.params,
          [key]: value
        }
      };
    });
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    setNodeData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        params: {
          ...prev.params,
          [parentKey]: {
            ...(prev.params[parentKey]),
            [childKey]: value
          }
        }
      };
    });
  };

  const handleSave = () => {
    if (nodeData) {
      onUpdateNode(nodeData);
    }
    onClose();
  };

  // Get the node definition from the registry
  const nodeDef = nodeRegistry[nodeData.type];
  
  return (
    <div className="node-config-panel" style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '300px',
      height: '100%',
      background: 'white',
      borderLeft: '1px solid #ddd',
      padding: '20px',
      boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
      zIndex: 10,
      overflowY: 'auto'
    }}>
      <div className="panel-header" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{nodeData.label} Configuration</h3>
        <div style={{ color: '#666', fontSize: '0.9em' }}>
          {nodeDef?.description || 'Configure node parameters'}
        </div>
      </div>

      <div className="panel-content">
        {Object.entries(nodeData.params).map(([key, value]) => {
          // Handle nested objects (like llm config)
          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} className="param-group" style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Settings
                </h4>
                {Object.entries(value).map(([childKey, childValue]) => (
                  <div key={`${key}-${childKey}`} className="param-field" style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      {childKey.charAt(0).toUpperCase() + childKey.slice(1)}:
                    </label>
                    {typeof childValue === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={childValue}
                        onChange={(e) => handleNestedChange(key, childKey, e.target.checked)}
                      />
                    ) : (
                      <input
                        type={typeof childValue === 'number' ? 'number' : 'text'}
                        value={childValue}
                        onChange={(e) => handleNestedChange(
                          key, 
                          childKey, 
                          typeof childValue === 'number' ? parseFloat(e.target.value) : e.target.value
                        )}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          }
          
          // Handle primitive values
          return (
            <div key={key} className="param-field" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </label>
              {typeof value === 'boolean' ? (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleChange(key, e.target.checked)}
                />
              ) : key === 'template' ? (
                <textarea
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              ) : (
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => handleChange(
                    key, 
                    typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                  )}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="panel-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={onClose}
          style={{ padding: '8px 15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          style={{ padding: '8px 15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;