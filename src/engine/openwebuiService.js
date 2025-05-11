/**
 * Service for interacting with OpenWebUI knowledge bases
 */
import { getOpenWebUIUrl, getOpenWebUIToken } from '../utils/config';

/**
 * Get available knowledge bases from OpenWebUI
 * @param {string} baseUrl - The base URL of the OpenWebUI instance (optional, defaults to env var)
 * @param {string} token - Authentication token (optional, defaults to env var)
 * @returns {Promise<Array>} - Array of knowledge base objects
 */
export const getKnowledgeBases = async (baseUrl = getOpenWebUIUrl(), token = getOpenWebUIToken()) => {
  try {
    console.log(`Fetching knowledge bases from OpenWebUI at ${baseUrl}/api/v1/knowledge/`);
    
    // Prepare headers with authentication if token is provided
    const headers = {
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseUrl}/api/v1/knowledge/`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`OpenWebUI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Raw knowledge base data:", data);
    
    // Format the knowledge bases for display in a dropdown
    // Based on the actual API response format: [{"id":"...", "name":"...", "description":"..."}]
    const knowledgeBases = (Array.isArray(data) ? data : (data.knowledgeBases || data || [])).map(kb => ({
      id: kb.id || kb.name || kb.collection_name || kb,
      name: kb.name || kb.collection_name || kb.id || kb,
      description: kb.description || '',
      documentCount: kb.documentCount || kb.document_count || 
                    (kb.data && kb.data.file_ids ? kb.data.file_ids.length : 0)
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
 * @param {string} options.baseUrl - The base URL of the OpenWebUI instance (optional, defaults to env var)
 * @param {string} options.token - Authentication token (optional, defaults to env var)
 * @param {string} options.knowledgeBase - The ID or name of the knowledge base
 * @param {string} options.query - The query text
 * @param {number} options.topK - Number of results to return
 * @param {number} options.minScore - Minimum similarity score (0-1)
 * @returns {Promise<Object>} - Query results
 */
export const queryKnowledgeBase = async (options) => {
  try {
    const { 
      baseUrl = getOpenWebUIUrl(), 
      token = getOpenWebUIToken(), 
      knowledgeBase, 
      query, 
      topK = 5, 
      minScore = 0.7 
    } = options;
    
    console.log(`Querying OpenWebUI knowledge base "${knowledgeBase}" with: ${query}`);
    
    // Construct the query URL
    const queryParams = new URLSearchParams({
      collection_id: knowledgeBase,  // Use collection_id instead of collection_name
      query: query,
      top_k: topK,
      threshold: minScore
    });
    
    const queryUrl = `${baseUrl}/api/v1/knowledge/query?${queryParams.toString()}`;
    console.log(`Query URL: ${queryUrl}`);
    
    // Prepare headers with authentication if token is provided
    const headers = {
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using authentication token for request');
    }
    
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`OpenWebUI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Raw query response:", data);
    
    // Extract results from the response
    // The response might be in different formats depending on the API
    let results = [];
    
    if (Array.isArray(data)) {
      // If the response is an array, use it directly
      results = data;
    } else if (data.results) {
      // If the response has a results property, use that
      results = data.results;
    } else if (data.documents) {
      // If the response has a documents property, use that
      results = data.documents;
    } else if (data.matches) {
      // If the response has a matches property, use that
      results = data.matches;
    } else {
      // Otherwise, use the entire response
      results = [data];
    }
    
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
    let content = '';
    
    if (typeof result === 'string') {
      // If the result is a string, use it directly
      content = result;
    } else if (result.content) {
      content = result.content;
    } else if (result.text) {
      content = result.text;
    } else if (result.page_content) {
      content = result.page_content;
    } else if (result.document) {
      content = result.document;
    } else if (result.metadata && result.metadata.text) {
      content = result.metadata.text;
    } else {
      // Try to stringify the result if it's an object
      try {
        content = JSON.stringify(result);
      } catch (e) {
        content = "Unable to extract content from result";
      }
    }
    
    // Extract metadata
    const metadata = result.metadata || {};
    
    // Try to extract a title
    let title = 'Untitled';
    if (result.title) {
      title = result.title;
    } else if (metadata.title) {
      title = metadata.title;
    } else if (metadata.filename) {
      title = metadata.filename;
    } else if (result.name) {
      title = result.name;
    }
    
    // Try to extract a source
    let source = 'Unknown';
    if (result.source) {
      source = result.source;
    } else if (metadata.source) {
      source = metadata.source;
    } else if (metadata.url) {
      source = metadata.url;
    } else if (metadata.filename) {
      source = metadata.filename;
    } else if (result.id) {
      source = `ID: ${result.id}`;
    }
    
    // Try to extract a score
    let score = 'N/A';
    if (result.score !== undefined) {
      score = result.score;
    } else if (result.similarity !== undefined) {
      score = result.similarity;
    } else if (result.relevance !== undefined) {
      score = result.relevance;
    } else if (result.distance !== undefined) {
      score = result.distance;
    }
    
    // Format the document
    return `[Document ${index + 1}] ${title}\n${content}\n(Source: ${source}, Score: ${score})`;
  }).join('\n\n');
};