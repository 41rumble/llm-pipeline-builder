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

// Real implementation of Ollama API call
export const callOllama = async (request) => {
  console.log(`[Ollama] Calling ${request.model || "llama3"} with prompt: ${request.prompt.substring(0, 50)}...`);
  
  try {
    // Prepare the request to the Ollama API
    const ollamaRequest = {
      model: request.model || "llama3",
      prompt: request.prompt,
      options: {
        temperature: request.temperature || 0.7,
        num_predict: request.max_tokens || 1000
      }
    };
    
    // Make the API call to the local Ollama instance
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
    
    // Parse the response
    const data = await response.json();
    
    // Return the response in a standardized format
    return {
      text: data.response || "",
      model: request.model || "llama3"
    };
  } catch (error) {
    console.error("Error calling Ollama:", error);
    
    // Provide a fallback response in case of error
    return {
      text: `Error calling Ollama: ${error.message}. Please make sure Ollama is running on http://localhost:11434.`,
      model: request.model || "llama3",
      error: true
    };
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