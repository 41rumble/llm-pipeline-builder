/**
 * Service for interacting with OpenWebUI knowledge bases
 */

/**
 * Get available knowledge bases from OpenWebUI
 * @param {string} baseUrl - The base URL of the OpenWebUI instance
 * @returns {Promise<Array>} - Array of knowledge base objects
 */
export const getKnowledgeBases = async (baseUrl) => {
  try {
    console.log(`Fetching knowledge bases from OpenWebUI at ${baseUrl}/api/knowledge`);
    
    const response = await fetch(`${baseUrl}/api/knowledge`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenWebUI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.knowledgeBases || [];
  } catch (error) {
    console.error("Error fetching OpenWebUI knowledge bases:", error);
    return [];
  }
};

/**
 * Query a knowledge base for relevant documents
 * @param {Object} options - Query options
 * @param {string} options.baseUrl - The base URL of the OpenWebUI instance
 * @param {string} options.knowledgeBase - The ID or name of the knowledge base
 * @param {string} options.query - The query text
 * @param {number} options.topK - Number of results to return
 * @param {number} options.minScore - Minimum similarity score (0-1)
 * @returns {Promise<Object>} - Query results
 */
export const queryKnowledgeBase = async (options) => {
  try {
    const { baseUrl, knowledgeBase, query, topK = 5, minScore = 0.7 } = options;
    
    console.log(`Querying OpenWebUI knowledge base "${knowledgeBase}" with: ${query}`);
    
    const queryParams = new URLSearchParams({
      kb: knowledgeBase,
      q: query,
      top_k: topK,
      min_score: minScore
    });
    
    const response = await fetch(`${baseUrl}/api/knowledge/query?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenWebUI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the results
    return {
      query,
      results: data.results || [],
      context: formatResultsAsContext(data.results || [])
    };
  } catch (error) {
    console.error("Error querying OpenWebUI knowledge base:", error);
    return {
      query,
      results: [],
      context: `Error querying knowledge base: ${error.message}`
    };
  }
};

/**
 * Format query results as a context string
 * @param {Array} results - Array of result objects
 * @returns {string} - Formatted context string
 */
const formatResultsAsContext = (results) => {
  if (!results || results.length === 0) {
    return "";
  }
  
  return results.map((result, index) => {
    return `[Document ${index + 1}] ${result.title || 'Untitled'}\n${result.content || result.text || ''}\n(Source: ${result.source || 'Unknown'}, Score: ${result.score || 'N/A'})`;
  }).join('\n\n');
};