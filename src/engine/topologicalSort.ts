import { Pipeline, PipelineNode, PipelineEdge } from '../utils/exportUtils';

/**
 * Performs a topological sort on the pipeline graph
 * to determine the execution order of nodes
 */
export const topologicalSort = (pipeline: Pipeline): PipelineNode[] => {
  const { nodes, edges } = pipeline;
  
  // Create a map of node IDs to their in-degree (number of incoming edges)
  const inDegree: Record<string, number> = {};
  nodes.forEach(node => {
    inDegree[node.id] = 0;
  });
  
  // Count incoming edges for each node
  edges.forEach(edge => {
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
  });
  
  // Queue nodes with no incoming edges (in-degree of 0)
  const queue: PipelineNode[] = nodes.filter(node => inDegree[node.id] === 0);
  
  // Result array for the sorted nodes
  const result: PipelineNode[] = [];
  
  // Process the queue
  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    result.push(currentNode);
    
    // Find all edges going out from the current node
    const outgoingEdges = edges.filter(edge => edge.source === currentNode.id);
    
    // Decrease in-degree of target nodes and add to queue if in-degree becomes 0
    outgoingEdges.forEach(edge => {
      inDegree[edge.target]--;
      if (inDegree[edge.target] === 0) {
        const targetNode = nodes.find(node => node.id === edge.target);
        if (targetNode) {
          queue.push(targetNode);
        }
      }
    });
  }
  
  // Check if we have a cycle (not all nodes included in result)
  if (result.length !== nodes.length) {
    throw new Error('The pipeline contains a cycle, which is not supported.');
  }
  
  return result;
};