import React, { useState, useEffect } from 'react';
import { getKnowledgeBases } from '../engine/openwebuiService';

/**
 * Component for selecting knowledge bases from OpenWebUI
 */
const KnowledgeBaseSelector = ({ value, onChange, serverUrl, token = '' }) => {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch knowledge bases
  const fetchKnowledgeBases = async () => {
    if (!serverUrl) {
      setError('Server URL is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching knowledge bases from ${serverUrl}...`);
      const bases = await getKnowledgeBases(serverUrl, token);
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

  // Fetch knowledge bases when the component mounts or serverUrl changes
  useEffect(() => {
    fetchKnowledgeBases();
  }, [serverUrl]);

  // Handle selection change
  const handleChange = (e) => {
    const selectedId = e.target.value;
    onChange(selectedId);
  };

  // Render the selector
  return (
    <div className="knowledge-base-selector">
      <div className="kb-selector-header" style={{ display: 'flex', gap: '8px' }}>
        <select 
          className="form-control" 
          value={value || ''} 
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
      
      {value && (
        <div className="selected-knowledge-base" style={{ marginTop: '8px', fontStyle: 'italic' }}>
          {knowledgeBases.find(kb => kb.id === value)?.description || ''}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseSelector;