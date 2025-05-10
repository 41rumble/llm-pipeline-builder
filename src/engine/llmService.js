/**
 * Service for making LLM API calls
 * This is a mock implementation that would be replaced with actual API calls
 */

// Mock implementation of OpenAI API call
export const callOpenAI = async (request) => {
  console.log(`[OpenAI] Calling ${request.model} with prompt: ${request.prompt.substring(0, 50)}...`);
  
  // In a real implementation, this would make an API call to OpenAI
  // For now, we'll simulate a response with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response based on the prompt
  let responseText = '';
  
  if (request.prompt.includes('questions')) {
    // If asking for questions, return a JSON array
    responseText = JSON.stringify([
      "What is the main goal of the project?",
      "What technologies are being used?",
      "What are the key challenges?",
      "What is the timeline for completion?",
      "How will success be measured?"
    ]);
  } else if (request.prompt.includes('summary') || request.prompt.includes('summarize')) {
    // If asking for a summary
    responseText = "This project aims to create a flexible LLM pipeline system with a visual editor and execution engine. It uses React Flow for the UI and supports various node types for different operations.";
  } else {
    // Generic response
    responseText = "I've processed your request and generated a response based on the provided input.";
  }
  
  return {
    text: responseText,
    model: request.model,
    usage: {
      prompt_tokens: request.prompt.length / 4,
      completion_tokens: responseText.length / 4,
      total_tokens: (request.prompt.length + responseText.length) / 4
    }
  };
};

// Mock implementation of Ollama API call
export const callOllama = async (request) => {
  console.log(`[Ollama] Calling ${request.model} with prompt: ${request.prompt.substring(0, 50)}...`);
  
  // In a real implementation, this would make an API call to Ollama
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock response
  const responseText = "Response from local Ollama model: " + request.prompt.substring(0, 20) + "...";
  
  return {
    text: responseText,
    model: request.model
  };
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