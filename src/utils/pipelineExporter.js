/**
 * Utility for exporting pipeline configurations to OpenWebUI compatible format
 */

/**
 * Export a pipeline configuration to OpenWebUI compatible JSON format
 * @param {Object} pipeline - The pipeline configuration
 * @returns {Object} - OpenWebUI compatible pipeline configuration
 */
export const exportPipelineToOpenWebUI = (pipeline) => {
  const { nodes, edges } = pipeline;
  
  // Create a mapping of node IDs to their indices in the nodes array
  const nodeIndexMap = new Map();
  nodes.forEach((node, index) => {
    nodeIndexMap.set(node.id, index);
  });
  
  // Convert nodes to OpenWebUI format
  const openWebUINodes = nodes.map(node => {
    // Base node structure
    const openWebUINode = {
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: {
        label: node.label || node.type,
        ...node.params
      }
    };
    
    // Add specific properties based on node type
    switch (node.type) {
      case 'input':
        openWebUINode.data.query = node.params?.query || '';
        break;
      case 'prompt':
        openWebUINode.data.template = node.params?.template || '';
        openWebUINode.data.llm = node.params?.llm || {};
        openWebUINode.data.fanOut = node.params?.fanOut || false;
        break;
      case 'llm':
        openWebUINode.data.model = node.params?.model || 'phi:latest';
        openWebUINode.data.temperature = node.params?.temperature || 0.7;
        openWebUINode.data.max_tokens = node.params?.max_tokens || 2000;
        break;
      case 'rag':
        openWebUINode.data.openwebui = node.params?.openwebui || {
          url: 'http://localhost:3005',
          token: '',
          knowledgeBase: '',
          topK: 5,
          minScore: 0.7
        };
        openWebUINode.data.template = node.params?.template || '';
        break;
      case 'summarizer':
        openWebUINode.data.template = node.params?.template || '';
        openWebUINode.data.llm = node.params?.llm || {};
        break;
      case 'output':
        // No special properties needed
        break;
    }
    
    return openWebUINode;
  });
  
  // Convert edges to OpenWebUI format
  const openWebUIEdges = edges.map(edge => {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    };
  });
  
  // Create the final OpenWebUI pipeline configuration
  const openWebUIPipeline = {
    id: pipeline.id || generatePipelineId(),
    name: pipeline.name || 'Exported Pipeline',
    description: pipeline.description || 'Pipeline exported from LLM Pipeline Builder',
    nodes: openWebUINodes,
    edges: openWebUIEdges,
    version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return openWebUIPipeline;
};

/**
 * Generate a unique ID for a pipeline
 * @returns {string} - A unique ID
 */
const generatePipelineId = () => {
  return 'pipeline_' + Math.random().toString(36).substring(2, 11);
};

/**
 * Export a pipeline configuration to a JSON file
 * @param {Object} pipeline - The pipeline configuration
 * @returns {string} - JSON string of the pipeline configuration
 */
export const exportPipelineToJSON = (pipeline) => {
  const openWebUIPipeline = exportPipelineToOpenWebUI(pipeline);
  return JSON.stringify(openWebUIPipeline, null, 2);
};

/**
 * Download a pipeline configuration as a JSON file
 * @param {Object} pipeline - The pipeline configuration
 * @param {string} filename - The name of the file to download
 */
export const downloadPipelineAsJSON = (pipeline, filename = 'pipeline.json') => {
  const json = exportPipelineToJSON(pipeline);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};