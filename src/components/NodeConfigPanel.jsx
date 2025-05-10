import { useState, useEffect, useRef } from 'react';
import nodeRegistry from '../utils/nodeRegistry';
import { getOllamaModels } from '../engine/llmService';

const NodeConfigPanel = ({ selectedNode, onUpdateNode, onClose }) => {
  const [nodeData, setNodeData] = useState(null);
  const previousNodeIdRef = useRef(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  useEffect(() => {
    // If we had a previous node and we're switching to a new one, save the changes
    if (previousNodeIdRef.current && 
        selectedNode && 
        previousNodeIdRef.current !== selectedNode.id && 
        nodeData) {
      // Save changes to the previous node
      onUpdateNode(nodeData.data);
    }
    
    // Update the reference to the current node
    previousNodeIdRef.current = selectedNode ? selectedNode.id : null;
    
    // Set the new node data
    if (selectedNode) {
      console.log('Setting node data in config panel:', 
        selectedNode.id, 
        'Type:', selectedNode.data?.type
      );
      
      // Just use the selected node directly
      setNodeData(selectedNode);
    } else {
      setNodeData(null);
    }
  }, [selectedNode, onUpdateNode]);

  // Auto-save when component unmounts
  useEffect(() => {
    return () => {
      if (nodeData && nodeData.data) {
        console.log('Auto-saving node on unmount:', 
          nodeData.id, 
          'Type:', nodeData.data.type
        );
        
        onUpdateNode(nodeData.data);
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
      
      // Create a deep copy of the previous state
      const updated = JSON.parse(JSON.stringify(prev));
      
      // Update the parameter value
      if (!updated.data.params) {
        updated.data.params = {};
      }
      updated.data.params[key] = value;
      
      console.log(`Changed ${key} to:`, value);
      
      return updated;
    });
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    setNodeData(prev => {
      if (!prev) return null;
      
      // Create a deep copy of the previous state
      const updated = JSON.parse(JSON.stringify(prev));
      
      // Ensure the parent object exists
      if (!updated.data.params) {
        updated.data.params = {};
      }
      if (!updated.data.params[parentKey]) {
        updated.data.params[parentKey] = {};
      }
      
      // Update the nested parameter value
      updated.data.params[parentKey][childKey] = value;
      
      console.log(`Changed ${parentKey}.${childKey} to:`, value);
      
      return updated;
    });
  };

  const handleSave = () => {
    if (nodeData && nodeData.data) {
      console.log('Saving node:', 
        nodeData.id, 
        'Type:', nodeData.data.type
      );
      
      onUpdateNode(nodeData.data);
    }
    onClose();
  };

  // Get the node definition from the registry
  const nodeType = nodeData.data?.type;
  const nodeDef = nodeRegistry[nodeType];
  
  // Get the node parameters
  const nodeParams = nodeData.data?.params || {};
  
  console.log('Node config panel:', {
    nodeType,
    nodeDef: nodeDef ? 'Found' : 'Not found',
    params: nodeParams
  });
  
  return (
    <div className="node-config-panel">
      <div className="node-config-header">
        <h3 className="node-config-title">{nodeData.data?.label || 'Node'} Configuration</h3>
        <div className="node-config-subtitle">
          {nodeDef?.description || 'Configure node parameters'}
        </div>
      </div>

      <div className="node-config-content">
        {Object.entries(nodeParams).map(([key, value]) => {
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
          
          // Handle model field specially
          if (key === 'model') {
            return (
              <div key={key} className="form-group">
                <label className="form-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
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
              </div>
            );
          }
          
          // Handle template field specially
          if (key === 'template') {
            return (
              <div key={key} className="form-group">
                <label className="form-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                <textarea
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="form-control"
                  rows={5}
                  placeholder="Enter template..."
                />
              </div>
            );
          }
          
          // Handle boolean fields
          if (typeof value === 'boolean') {
            return (
              <div key={key} className="form-group">
                <label className="form-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
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
              </div>
            );
          }
          
          // Handle number fields
          if (typeof value === 'number') {
            return (
              <div key={key} className="form-group">
                <label className="form-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                  className="form-control"
                  placeholder={`Enter ${key}...`}
                />
              </div>
            );
          }
          
          // Handle regular text fields
          return (
            <div key={key} className="form-group">
              <label className="form-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="form-control"
                placeholder={`Enter ${key}...`}
              />
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