import React, { useState, useEffect } from 'react';
import { getOpenWebUIToken } from '../utils/config';

/**
 * Component for entering the OpenWebUI token
 */
const TokenInput = () => {
  const [token, setToken] = useState(getOpenWebUIToken() || '');
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('openwebui_token', token);
      // Update the token in the window object for immediate use
      window.OPENWEBUI_TOKEN = token;
    }
  }, [token]);

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('openwebui_token');
    if (savedToken) {
      setToken(savedToken);
      // Update the token in the window object for immediate use
      window.OPENWEBUI_TOKEN = savedToken;
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('openwebui_token', token);
    // Update the token in the window object for immediate use
    window.OPENWEBUI_TOKEN = token;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="token-input" style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 9999,
    }}>
      {isOpen ? (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          maxWidth: '300px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>OpenWebUI Token</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ 
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              X
            </button>
          </div>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your OpenWebUI token"
              style={{ 
                flex: 1, 
                padding: '5px', 
                borderRadius: '3px', 
                border: '1px solid #444',
                backgroundColor: '#222',
                color: 'white'
              }}
            />
            <button
              onClick={() => setShowToken(!showToken)}
              style={{ 
                marginLeft: '5px', 
                padding: '5px', 
                borderRadius: '3px', 
                border: '1px solid #444',
                backgroundColor: '#333',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            onClick={handleSave}
            style={{ 
              width: '100%', 
              padding: '5px', 
              borderRadius: '3px', 
              border: '1px solid #444',
              backgroundColor: saved ? '#4CAF50' : '#333',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {saved ? 'Saved!' : 'Save Token'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{ 
            padding: '5px 10px', 
            borderRadius: '3px', 
            border: '1px solid #444',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          API Token
        </button>
      )}
    </div>
  );
};

export default TokenInput;