/**
 * Service for making LLM API calls
 * This implementation connects to real LLM services
 */

import * as ollamaService from './ollamaService';

// OpenAI API call implementation
export const callOpenAI = async (request) => {
  console.log(`[OpenAI] Calling ${request.model} with prompt: ${request.prompt.substring(0, 50)}...`);
  
  try {
    // For now, we'll redirect to Ollama since we don't have OpenAI API access
    console.log("Redirecting OpenAI request to local Ollama instance");
    return await callOllama({
      ...request,
      model: "llama3" // Default to llama3 when OpenAI is requested
    });
  } catch (error) {
    console.error("Error calling OpenAI (redirected to Ollama):", error);
    throw error;
  }
};

// Implementation of Ollama API call
export const callOllama = async (request) => {
  return await ollamaService.generateText(
    request.model || "llama3",
    request.prompt,
    {
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 1000
    }
  );
};

// Get available models from Ollama
export const getOllamaModels = async () => {
  return await ollamaService.getModels();
};

// Unified LLM service that routes to the appropriate implementation
export const callLLM = async (request) => {
  // Route to the appropriate LLM service based on the model
  if (request.model.startsWith('gpt-')) {
    return await callOpenAI(request);
  } else {
    return await callOllama(request);
  }
};