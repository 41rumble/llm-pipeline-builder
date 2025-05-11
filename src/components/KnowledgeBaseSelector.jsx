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
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Select Knowledge Bases (hold Ctrl/Cmd to select multiple):
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                className="form-control" 
                value={selectedValues} 
                onChange={handleChange}
                disabled={loading}
                style={{ flexGrow: 1 }}
                multiple={true}
                size={Math.min(5, knowledgeBases.length || 5)}
              >
                {knowledgeBases.map((kb) => (
                  <option key={kb.id} value={kb.id}>
                    {kb.name} ({kb.documentCount} docs)
                  </option>
                ))}
              </select>
              
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={fetchKnowledgeBases}
                disabled={loading}
                title="Refresh knowledge bases"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              className="form-control" 
              value={selectedValues[0] || ''} 
              onChange={handleChange}
              disabled={loading}
              style={{ flexGrow: 1 }}
            >
              <option value="">Select a knowledge base</option>
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name} ({kb.documentCount} docs)
                </option>
              ))}
            </select>
            
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={fetchKnowledgeBases}
              disabled={loading}
              title="Refresh knowledge bases"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
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
      
      {selectedValues.length > 0 && (
        <div className="selected-knowledge-bases" style={{ marginTop: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Selected Knowledge Bases:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {selectedValues.map(id => {
              const kb = knowledgeBases.find(kb => kb.id === id);
              return (
                <li key={id} style={{ marginBottom: '2px' }}>
                  <span style={{ fontWeight: 'bold' }}>{kb?.name || id}</span>
                  {kb?.description && (
                    <span style={{ fontStyle: 'italic', color: '#666', marginLeft: '4px' }}>
                      - {kb.description}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseSelector;