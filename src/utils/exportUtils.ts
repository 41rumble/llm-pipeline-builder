import { Node, Edge } from 'reactflow';
import { NodeData } from '../components/NodeTypes';

// Define the structure of the exported pipeline
export interface PipelineNode {
  id: string;
  type: string;
  params: Record<string, any>;
}

export interface PipelineEdge {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface Pipeline {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

/**
 * Converts React Flow nodes and edges to a pipeline JSON format
 */
export const exportToJSON = (
  nodes: Node<NodeData>[],
  edges: Edge[]
): Pipeline => {
  // Convert nodes to pipeline format
  const pipelineNodes: PipelineNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.data.type,
    params: node.data.params,
  }));

  // Convert edges to pipeline format
  const pipelineEdges: PipelineEdge[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return {
    nodes: pipelineNodes,
    edges: pipelineEdges,
  };
};

/**
 * Imports a pipeline JSON back to React Flow format
 */
export const importFromJSON = (
  pipeline: Pipeline
): { nodes: Node<NodeData>[]; edges: Edge[] } => {
  // Convert pipeline nodes to React Flow nodes
  const nodes: Node<NodeData>[] = pipeline.nodes.map((node) => ({
    id: node.id,
    type: 'default',
    position: { x: 0, y: 0 }, // Positions will need to be calculated or stored
    data: {
      label: node.type.charAt(0).toUpperCase() + node.type.slice(1),
      type: node.type,
      params: node.params,
    },
  }));

  // Convert pipeline edges to React Flow edges
  const edges: Edge[] = pipeline.edges.map((edge) => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: 'smoothstep',
    animated: true,
  }));

  return { nodes, edges };
};