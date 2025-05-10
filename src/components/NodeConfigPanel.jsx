import { useState, useEffect, useRef } from 'react';
import nodeRegistry from '../utils/nodeRegistry';
import { getOllamaModels } from '../engine/llmService';

const NodeConfigPanel = ({ selectedNode, onUpdateNode, onClose }) => {
  console.log('NodeConfigPanel received:', selectedNode);
  const [nodeData, setNodeData] = useState(null);
  const previousNodeIdRef = useRef(null);
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    // If we had a previous node and we're switching to a new one, save the changes
    if (previousNodeIdRef.current && 
        selectedNode && 
        previousNodeIdRef.current !== selectedNode.id && 
        nodeData) {
      // Save changes to the previous node
      onUpdateNode(nodeData);
    }
    
    // Update the reference to the current node
    previousNodeIdRef.current = selectedNode ? selectedNode.id : null;
    
    // Set the new node data
    if (selectedNode) {
      setNodeData({ ...selectedNode });
    } else {
      setNodeData(null);
    }
  }, [selectedNode, onUpdateNode]);

  // Auto-save when component unmounts
  useEffect(() => {
    return () => {
      if (nodeData) {
        onUpdateNode(nodeData);
      }
    };
  }, [nodeData, onUpdateNode]);
  
  // Fetch available models when the panel opens
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getOllamaModels();
        setAvailableModels(models);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    
    fetchModels();
  }, []);

  if (!nodeData) {
    return null;
  }

  const handleChange = (key, value) => {
    setNodeData(prev => {
      if (!prev) return null;
      
      // Create a copy of the previous state
      const updated = {
        ...prev,
        params: {
          ...prev.params,
          [key]: value
        }
      };
      
      // Ensure we preserve the node type
      if (prev.type) {
        updated.type = prev.type;
      }
      
      return updated;
    });
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    setNodeData(prev => {
      if (!prev) return null;
      
      // Create a copy of the previous state
      const updated = {
        ...prev,
        params: {
          ...prev.params,
          [parentKey]: {
            ...(prev.params[parentKey]),
            [childKey]: value
          }
        }
      };
      
      // Ensure we preserve the node type
      if (prev.type) {
        updated.type = prev.type;
      }
      
      return updated;
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
    <div className="node-config-panel">
      <div className="node-config-header">
        <h3 className="node-config-title">{nodeData.label} Configuration</h3>
        <div className="node-config-subtitle">
          {nodeDef?.description || 'Configure node parameters'}
        </div>
      </div>

      <div className="node-config-content">
        {Object.entries(nodeData.params).map(([key, value]) => {
          // Handle nested objects (like llm config)
          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} className="node-config-section">
                <h4 className="node-config-section-title">
                  {key.charAt(0).toUpperCase() + key.slice(1)} Settings
                </h4>
                {Object.entries(value).map(([childKey, childValue]) => (
                  <div key={`${key}-${childKey}`} className="form-group">
                    <label className="form-label">
                      {childKey.charAt(0).toUpperCase() + childKey.slice(1)}:
                    </label>
                    {typeof childValue === 'boolean' ? (
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id={`${key}-${childKey}`}
                          checked={childValue}
                          onChange={(e) => handleNestedChange(key, childKey, e.target.checked)}
                          className="form-check-input"
                        />
                        <label htmlFor={`${key}-${childKey}`} className="form-check-label">
                          {childValue ? 'Enabled' : 'Disabled'}
                        </label>
                      </div>
                    ) : childKey === 'model' ? (
                      <select
                        value={childValue}
                        onChange={(e) => handleNestedChange(key, childKey, e.target.value)}
                        className="form-control"
                      >
                        {/* Include the current value even if it's not in the available models */}
                        {!availableModels.includes(childValue) && (
                          <option value={childValue}>{childValue}</option>
                        )}
                        
                        {/* List all available models */}
                        {availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={typeof childValue === 'number' ? 'number' : 'text'}
                        value={childValue}
                        onChange={(e) => handleNestedChange(
                          key, 
                          childKey, 
                          typeof childValue === 'number' ? parseFloat(e.target.value) : e.target.value
                        )}
                        className="form-control"
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          }
          
          // Handle primitive values
          return (
            <div key={key} className="form-group">
              <label className="form-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </label>
              {typeof value === 'boolean' ? (
                <div className="form-check">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="form-check-input"
                  />
                  <label htmlFor={key} className="form-check-label">
                    {value ? 'Enabled' : 'Disabled'}
                  </label>
                </div>
              ) : key === 'template' ? (
                <textarea
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={5}
                  className="form-control"
                  placeholder="Enter template text..."
                />
              ) : key === 'model' ? (
                <select
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="form-control"
                >
                  {/* Include the current value even if it's not in the available models */}
                  {!availableModels.includes(value) && (
                    <option value={value}>{value}</option>
                  )}
                  
                  {/* List all available models */}
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => handleChange(
                    key, 
                    typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                  )}
                  className="form-control"
                  placeholder={`Enter ${key}...`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="node-config-footer">
        <button 
          onClick={onClose}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="btn btn-primary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;