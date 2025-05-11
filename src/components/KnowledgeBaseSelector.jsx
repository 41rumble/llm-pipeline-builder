import React, { useState, useEffect } from 'react';
import { getKnowledgeBases } from '../engine/openwebuiService';
import { getOpenWebUIUrl } from '../utils/config';

/**
 * Component for selecting knowledge bases from OpenWebUI
 * @param {Array|string} value - The selected knowledge base ID(s)
 * @param {Function} onChange - Callback when selection changes
 * @param {boolean} multiple - Whether to allow multiple selections
 */
const KnowledgeBaseSelector = ({ value, onChange, multiple = false }) => {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Convert value to array for consistent handling
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  // Function to fetch knowledge bases
  const fetchKnowledgeBases = async () => {
    setLoading(true);
    setError(null);

    try {
      const serverUrl = getOpenWebUIUrl();
      console.log(`Fetching knowledge bases from ${serverUrl}...`);
      const bases = await getKnowledgeBases();
      console.log(`Fetched ${bases.length} knowledge bases:`, bases);
      setKnowledgeBases(bases);
      
      // If we have a selected value but it's not in the fetched bases, log a warning
      if (value && !bases.some(kb => kb.id === value)) {
        console.warn(`Selected knowledge base "${value}" not found in fetched bases`);
      }
    } catch (err) {
      console.error('Error fetching knowledge bases:', err);
      setError('Failed to fetch knowledge bases. Please check the server URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch knowledge bases when the component mounts
  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  // Handle selection change
  const handleChange = (e) => {
    if (multiple) {
      // For multiple selection, get all selected options
      const options = e.target.options;
      const selectedIds = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedIds.push(options[i].value);
        }
      }
      onChange(selectedIds);
    } else {
      // For single selection
      const selectedId = e.target.value;
      onChange(selectedId);
    }
  };

  // Render the selector
  return (
    <div className="knowledge-base-selector">
      <div className="kb-selector-header">
        {multiple ? (
          <div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>Select Knowledge Bases:</span>
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={fetchKnowledgeBases}
                  disabled={loading}
                  title="Refresh knowledge bases"
                  style={{ marginLeft: '8px' }}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div style={{ fontSize: '0.8em', color: '#999', marginTop: '2px' }}>
                Hold Ctrl/Cmd to select multiple or click and drag
              </div>
            </div>
            <div>
              <select 
                className="form-control" 
                value={selectedValues} 
                onChange={handleChange}
                disabled={loading}
                style={{ 
                  width: '100%',
                  backgroundColor: '#222',
                  color: 'white',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  padding: '8px'
                }}
                multiple={true}
                size={Math.min(6, Math.max(3, knowledgeBases.length))}
              >
                {knowledgeBases.map((kb) => (
                  <option 
                    key={kb.id} 
                    value={kb.id}
                    style={{
                      padding: '6px 8px',
                      marginBottom: '2px',
                      borderRadius: '2px',
                      backgroundColor: selectedValues.includes(kb.id) ? '#2a4d69' : 'transparent'
                    }}
                  >
                    {kb.name} ({kb.documentCount} docs)
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Select Knowledge Base:</span>
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={fetchKnowledgeBases}
                disabled={loading}
                title="Refresh knowledge bases"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <select 
              className="form-control" 
              value={selectedValues[0] || ''} 
              onChange={handleChange}
              disabled={loading}
              style={{ 
                width: '100%',
                backgroundColor: '#222',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '8px'
              }}
            >
              <option value="">Select a knowledge base</option>
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name} ({kb.documentCount} docs)
                </option>
              ))}
            </select>
            
            {selectedValues[0] && (
              <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#aaa' }}>
                {knowledgeBases.find(kb => kb.id === selectedValues[0])?.description || ''}
              </div>
            )}
          </div>
        )}
      </div>
      
      {knowledgeBases.length === 0 && !loading && !error && (
        <div className="no-knowledge-bases" style={{ marginTop: '8px', color: '#666' }}>
          No knowledge bases found. Please create some in OpenWebUI first.
        </div>
      )}
      
      {error && (
        <div className="error-message" style={{ marginTop: '8px', color: 'red' }}>
          {error}
        </div>
      )}
      
      {selectedValues.length > 0 && multiple && (
        <div className="selected-knowledge-bases" style={{ marginTop: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Selected Knowledge Bases:
          </div>
          <div style={{ 
            backgroundColor: '#222', 
            padding: '8px', 
            borderRadius: '4px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {selectedValues.map(id => {
              const kb = knowledgeBases.find(kb => kb.id === id);
              return (
                <div key={id} style={{ 
                  marginBottom: '4px', 
                  padding: '4px 8px',
                  backgroundColor: '#333',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 'bold' }}>{kb?.name || 'Unknown KB'}</span>
                  {kb?.documentCount !== undefined && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '0.8em', 
                      backgroundColor: '#444',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {kb.documentCount} docs
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseSelector;