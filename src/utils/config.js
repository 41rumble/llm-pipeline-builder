/**
 * Configuration utility for environment variables
 * 
 * Note: In a browser environment, we can't use process.env directly.
 * Instead, we'll use Vite's import.meta.env which makes environment
 * variables available at build time.
 */

// OpenWebUI configuration
export const OPENWEBUI_CONFIG = {
  // Use Vite's environment variables (defined in .env files)
  // These are replaced at build time
  url: import.meta.env.VITE_OPENWEBUI_URL || 'http://localhost:3005',
  token: import.meta.env.VITE_OPENWEBUI_TOKEN || '',
};

// Ollama configuration
export const OLLAMA_CONFIG = {
  url: import.meta.env.VITE_OLLAMA_SERVER_URL || 'http://localhost:11434',
};

/**
 * Get the OpenWebUI URL
 * @returns {string} The OpenWebUI URL
 */
export const getOpenWebUIUrl = () => {
  return OPENWEBUI_CONFIG.url;
};

/**
 * Get the OpenWebUI token
 * @returns {string} The OpenWebUI token
 */
export const getOpenWebUIToken = () => {
  console.log('Getting OpenWebUI token:', OPENWEBUI_CONFIG.token ? 'Token exists' : 'No token found');
  return OPENWEBUI_CONFIG.token;
};

/**
 * Get the Ollama server URL
 * @returns {string} The Ollama server URL
 */
export const getOllamaServerUrl = () => {
  return OLLAMA_CONFIG.url;
};

export default {
  OPENWEBUI_CONFIG,
  OLLAMA_CONFIG,
  getOpenWebUIUrl,
  getOpenWebUIToken,
  getOllamaServerUrl,
};