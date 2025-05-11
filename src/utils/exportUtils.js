/**
 * Converts React Flow nodes and edges to a pipeline JSON format
 */
export const exportToJSON = (nodes, edges) => {
  // Convert nodes to pipeline format
  const pipelineNodes = nodes.map((node) => ({
    id: node.id,
    type: node.data.type,
    params: node.data.params,
    position: { x: node.position.x, y: node.position.y },
    label: node.data.label || node.data.type
  }));

  // Convert edges to pipeline format
  const pipelineEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return {
    id: `pipeline_${Date.now()}`,
    name: "Pipeline",
    description: "Pipeline created with LLM Pipeline Builder",
    nodes: pipelineNodes,
    edges: pipelineEdges,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Export a pipeline configuration to OpenWebUI compatible format
 * @param {Array} nodes - The React Flow nodes
 * @param {Array} edges - The React Flow edges
 * @returns {Object} - OpenWebUI compatible pipeline configuration
 */
export const exportToOpenWebUI = (nodes, edges) => {
  // First convert to our internal pipeline format
  const pipeline = exportToJSON(nodes, edges);

  // Convert to OpenWebUI Pipelines format
  // Based on the OpenWebUI Pipelines documentation
  const openWebUIPipeline = {
    id: pipeline.id,
    name: pipeline.name || "Pipeline",
    description: pipeline.description || "Pipeline created with LLM Pipeline Builder",
    nodes: pipeline.nodes.map(node => ({
      id: node.id,
      type: node.type,
      params: node.params || {},
      position: node.position || { x: 0, y: 0 }
    })),
    edges: pipeline.edges.map(edge => ({
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target
    })),
    created_at: pipeline.created_at || new Date().toISOString(),
    updated_at: pipeline.updated_at || new Date().toISOString(),
    version: "1.0",
    format: "openwebui-pipeline"
  };

  return openWebUIPipeline;
};

/**
 * Download a pipeline configuration as a JSON file
 * @param {Array} nodes - The React Flow nodes
 * @param {Array} edges - The React Flow edges
 * @param {string} format - The export format ('default' or 'openwebui')
 * @param {string} filename - The name of the file to download
 */
export const downloadPipelineAsJSON = (nodes, edges, format = 'default', filename = 'pipeline.json') => {
  let pipelineData;

  if (format === 'openwebui') {
    pipelineData = exportToOpenWebUI(nodes, edges);
    filename = filename || 'openwebui_pipeline.json';
  } else {
    pipelineData = exportToJSON(nodes, edges);
    filename = filename || 'pipeline.json';
  }

  const json = JSON.stringify(pipelineData, null, 2);
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

/**
 * Imports a pipeline JSON back to React Flow format
 * @param {Object} pipeline - The pipeline configuration
 * @returns {Object} - The React Flow nodes and edges
 */
export const importFromJSON = (pipeline) => {
  // Convert pipeline nodes to React Flow nodes
  const nodes = pipeline.nodes.map((node) => {
    // Create a React Flow node
    return {
      id: node.id,
      type: 'default',
      position: node.position || { x: 0, y: 0 },
      data: {
        label: node.label || node.type,
        type: node.type,
        params: node.params || {}
      }
    };
  });

  // Convert pipeline edges to React Flow edges
  const edges = pipeline.edges.map((edge) => {
    // Create a React Flow edge
    return {
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'smoothstep',
      animated: true
    };
  });

  return { nodes, edges };
};