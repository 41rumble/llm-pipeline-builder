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
  
  // Generate a more dynamic mock response based on the prompt
  let responseText = '';
  
  // Extract a keyword from the prompt to make responses more varied
  const promptLower = request.prompt.toLowerCase();
  const keywords = ['project', 'data', 'code', 'design', 'research', 'analysis', 'development', 'testing', 'deployment', 'marketing'];
  const matchedKeyword = keywords.find(keyword => promptLower.includes(keyword)) || 'topic';
  
  if (promptLower.includes('questions') || promptLower.includes('break') || promptLower.includes('list')) {
    // If asking for questions, return a JSON array with dynamic content
    const questions = [
      `What is the main goal of the ${matchedKeyword}?`,
      `What resources are needed for the ${matchedKeyword}?`,
      `What are the key challenges in this ${matchedKeyword}?`,
      `What is the timeline for the ${matchedKeyword}?`,
      `How will success be measured for this ${matchedKeyword}?`
    ];
    
    // Add the input text as part of a question to show it's using the input
    if (request.prompt.length > 10) {
      const inputSnippet = request.prompt.substring(0, 20).replace(/[^\w\s]/gi, '');
      questions.push(`How does "${inputSnippet}..." relate to the overall ${matchedKeyword}?`);
    }
    
    responseText = JSON.stringify(questions);
  } else if (promptLower.includes('summary') || promptLower.includes('summarize')) {
    // If asking for a summary, include part of the original prompt
    const promptSnippet = request.prompt.substring(0, 30).replace(/[^\w\s]/gi, '');
    responseText = `Summary regarding "${promptSnippet}...": This ${matchedKeyword} aims to create value through innovative approaches. It requires careful planning and execution to achieve the desired outcomes.`;
  } else {
    // Generic response that includes part of the input to show it's being used
    const promptSnippet = request.prompt.substring(0, 20).replace(/[^\w\s]/gi, '');
    responseText = `Response to "${promptSnippet}...": I've analyzed your input about ${matchedKeyword} and generated this dynamic response to demonstrate that different inputs produce different outputs.`;
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
  
  // Generate a more dynamic mock response
  const promptLower = request.prompt.toLowerCase();
  let responseText = "";
  
  if (promptLower.includes('questions') || promptLower.includes('list')) {
    // Create a list response
    responseText = "Based on your input, here are some key points to consider:\n\n";
    responseText += "1. " + request.prompt.substring(0, 20) + " is an important aspect to analyze\n";
    responseText += "2. Consider the implications on the overall system\n";
    responseText += "3. Evaluate potential alternatives and trade-offs\n";
    responseText += "4. Measure the impact on user experience\n";
    responseText += "5. Plan for future scalability and maintenance";
  } else if (promptLower.includes('summary')) {
    // Create a summary response
    responseText = "Summary of your request about " + request.prompt.substring(0, 15) + ":\n\n";
    responseText += "The topic involves several key considerations and potential approaches. ";
    responseText += "Analysis suggests focusing on core functionality first, then expanding to additional features. ";
    responseText += "This approach aligns with best practices in the field.";
  } else {
    // Generic response that incorporates parts of the input
    responseText = "Response from local Ollama model regarding '" + request.prompt.substring(0, 30) + "':\n\n";
    responseText += "I've processed your input and generated this response to show that the model is ";
    responseText += "using your specific prompt to create unique outputs. Each different input will ";
    responseText += "produce a different response, demonstrating that the system is working correctly.";
  }
  
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