import React from 'react';
import { OPENWEBUI_CONFIG, OLLAMA_CONFIG } from '../utils/config';

/**
 * Debug panel to display environment variables and configuration
 */
const DebugPanel = () => {
  return (
    <div className="debug-panel" style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '12px'
    }}>
      <h3>Debug Information</h3>
      <div>
        <h4>OpenWebUI Config:</h4>
        <pre>{JSON.stringify({
          url: OPENWEBUI_CONFIG.url,
          token: OPENWEBUI_CONFIG.token ? 'Token exists' : 'No token'
        }, null, 2)}</pre>
      </div>
      <div>
        <h4>Ollama Config:</h4>
        <pre>{JSON.stringify(OLLAMA_CONFIG, null, 2)}</pre>
      </div>
      <div>
        <h4>Environment Variables:</h4>
        <pre>{JSON.stringify({
          VITE_OPENWEBUI_URL: import.meta.env.VITE_OPENWEBUI_URL || 'Not set',
          VITE_OPENWEBUI_TOKEN: import.meta.env.VITE_OPENWEBUI_TOKEN ? 'Set' : 'Not set',
          VITE_OLLAMA_SERVER_URL: import.meta.env.VITE_OLLAMA_SERVER_URL || 'Not set',
          MODE: import.meta.env.MODE,
          DEV: import.meta.env.DEV,
          PROD: import.meta.env.PROD
        }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DebugPanel;