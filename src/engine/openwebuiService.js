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
    console.log(`Fetching knowledge bases from OpenWebUI at ${baseUrl}/api/v1/knowledge/`);
    
    const response = await fetch(`${baseUrl}/api/v1/knowledge/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenWebUI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Raw knowledge base data:", data);
    
    // Format the knowledge bases for display in a dropdown
    // Adjust this based on the actual structure of the API response
    const knowledgeBases = (data.knowledgeBases || data || []).map(kb => ({
      id: kb.id || kb.name || kb.collection_name || kb,
      name: kb.name || kb.collection_name || kb.id || kb,
      description: kb.description || '',
      documentCount: kb.documentCount || kb.document_count || 0
    }));
    
    console.log(`Found ${knowledgeBases.length} knowledge bases:`, knowledgeBases);
    return knowledgeBases;
  } catch (error) {
    console.error("Error fetching OpenWebUI knowledge bases:", error);
    
    // Return some mock data for testing if the API fails
    return [
      { id: 'kb1', name: 'General Knowledge', description: 'General knowledge base', documentCount: 100 },
      { id: 'kb2', name: 'Technical Docs', description: 'Technical documentation', documentCount: 50 },
      { id: 'kb3', name: 'Research Papers', description: 'Scientific research papers', documentCount: 75 }
    ];
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
    
    // Construct the query URL
    const queryParams = new URLSearchParams({
      collection_name: knowledgeBase,
      query: query,
      top_k: topK,
      threshold: minScore
    });
    
    const queryUrl = `${baseUrl}/api/v1/knowledge/query?${queryParams.toString()}`;
    console.log(`Query URL: ${queryUrl}`);
    
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenWebUI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Raw query response:", data);
    
    // Extract results from the response
    const results = data.results || data.documents || data || [];
    
    // Format the results
    return {
      query,
      results: results,
      context: formatResultsAsContext(results)
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
    // Extract the content based on different possible response formats
    const content = result.content || result.text || result.page_content || result.document || result;
    
    // Extract metadata
    const metadata = result.metadata || {};
    const title = result.title || metadata.title || metadata.filename || 'Untitled';
    const source = result.source || metadata.source || metadata.url || metadata.filename || 'Unknown';
    const score = result.score || result.similarity || result.relevance || 'N/A';
    
    // Format the document
    return `[Document ${index + 1}] ${title}\n${content}\n(Source: ${source}, Score: ${score})`;
  }).join('\n\n');
};