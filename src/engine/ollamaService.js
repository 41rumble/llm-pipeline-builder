/**
 * Service for making Ollama API calls
 */

// Configuration for the Ollama server
export const OLLAMA_SERVER_URL = 'http://192.168.200.184:11434';

// Helper function to handle API errors
const handleApiError = async (response, context) => {
  console.error(`Ollama ${context} API error: ${response.status} ${response.statusText}`);
  
  // Try to get more details from the response
  try {
    const errorData = await response.text();
    console.error('Error response:', errorData);
    throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorData}`);
  } catch (parseError) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }
};

/**
 * Call the Ollama API to generate text
 */
export const generateText = async (model, prompt, options = {}) => {
  console.log(`[Ollama] Calling ${model} with prompt: ${prompt.substring(0, 50)}...`);
  
  try {
    // Prepare the request to the Ollama API for the generate endpoint
    const generateRequest = {
      model: model || "phi:latest", // Use a smaller model by default
      prompt: prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.max_tokens || 1000
      }
    };
    
    console.log(`Connecting to Ollama at ${OLLAMA_SERVER_URL}/api/generate`);
    
    // Make the API call to the Ollama generate endpoint
    const response = await fetch(`${OLLAMA_SERVER_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(generateRequest),
      mode: 'cors' // Try with CORS mode
    });
    
    if (!response.ok) {
      await handleApiError(response, 'generate');
    }
    
    const data = await response.json();
    
    // Extract the response from the generate API format
    let responseText = "";
    if (data.response) {
      // Generate API format
      responseText = data.response;
    } else {
      // Unknown format
      console.warn("Unexpected response format from Ollama:", data);
      responseText = JSON.stringify(data);
    }
    
    return {
      text: responseText,
      model: model
    };
  } catch (error) {
    console.error("Error in Ollama service:", error);
    
    // Provide a fallback response in case of error
    return {
      text: `Error connecting to Ollama at ${OLLAMA_SERVER_URL}: ${error.message}. 
      
Please make sure Ollama is running at the specified address and that you have the requested model (${model || "llama3"}) installed.

You can install models with: ollama pull modelname`,
      model: model || "llama3",
      error: true
    };
  }
};

/**
 * Get available models from Ollama
 */
export const getModels = async () => {
  try {
    console.log(`Fetching models from Ollama at ${OLLAMA_SERVER_URL}/api/tags`);
    
    // Try to fetch models from Ollama
    const response = await fetch(`${OLLAMA_SERVER_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors' // Try with CORS mode
    });
    
    if (!response.ok) {
      await handleApiError(response, 'tags');
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