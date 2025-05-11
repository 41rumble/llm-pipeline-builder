/**
 * Configuration utility for environment variables
 */
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// OpenWebUI configuration
export const OPENWEBUI_CONFIG = {
  url: process.env.OPENWEBUI_URL || 'http://localhost:3005',
  token: process.env.OPENWEBUI_TOKEN || '',
};

// Ollama configuration
export const OLLAMA_CONFIG = {
  url: process.env.OLLAMA_SERVER_URL || 'http://localhost:11434',
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