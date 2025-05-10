/**
 * Service for making LLM API calls
 * This implementation connects to real LLM services
 */

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
  console.log(`[Ollama] Calling ${request.model || "llama3"} with prompt: ${request.prompt.substring(0, 50)}...`);
  
  try {
    // Prepare the request to the Ollama API
    // According to Ollama API docs: https://github.com/ollama/ollama/blob/main/docs/api.md
    const ollamaRequest = {
      model: request.model || "llama3",
      prompt: request.prompt,
      stream: false,
      options: {
        temperature: request.temperature || 0.7,
        num_predict: request.max_tokens || 1000
      }
    };
    
    // Make the API call to the Ollama generate endpoint
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ollamaRequest)
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      text: data.response || "",
      model: request.model || "llama3"
    };
  } catch (error) {
    console.error("Error in Ollama service:", error);
    
    // Provide a fallback response in case of error
    return {
      text: `Error connecting to Ollama: ${error.message}. 
      
Please make sure Ollama is running with the command 'ollama serve' and that you have the requested model (${request.model || "llama3"}) installed.

You can install models with: ollama pull modelname`,
      model: request.model || "llama3",
      error: true
    };
  }
};

// Get available models from Ollama
export const getOllamaModels = async () => {
  try {
    // Try to fetch models from Ollama
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract just the model names from the response
    if (data.models && Array.isArray(data.models)) {
      return data.models.map(model => model.name);
    }
    
    // Return the list of models
    return [];
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    
    // Return some default models if we can't connect
    return [
      "llama3",
      "mistral",
      "gemma",
      "phi",
      "codellama"
    ];
  }
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