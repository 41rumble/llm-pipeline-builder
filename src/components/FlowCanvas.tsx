import { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeTypes,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  Panel
} from 'reactflow';
import 'reactflow/dist/base.css';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import BaseNode from './nodes/BaseNode';
import NodeConfigPanel from './NodeConfigPanel';
import { NodeData } from './NodeTypes';
import nodeRegistry, { NodeDefinition, getAllNodeDefs } from '../utils/nodeRegistry';
import { exportToJSON, Pipeline } from '../utils/exportUtils';

// Define the node types for React Flow
const nodeTypes: NodeTypes = {
  default: BaseNode,
};

interface FlowCanvasProps {
  onExecute?: (pipeline: Pipeline) => void;
}

const FlowCanvas = ({ onExecute }: FlowCanvasProps) => {
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // UI states
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<NodeData>);
    setShowNodePanel(true);
  }, []);

  // Handle edge connections
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: ConnectionLineType.SmoothStep,
      animated: true,
    }, eds));
  }, [setEdges]);

  // Update node data when configuration changes
  const handleUpdateNode = useCallback((updatedData: NodeData) => {
    if (!selectedNode) return;
    
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: updatedData,
          };
        }
        return node;
      })
    );
  }, [selectedNode, setNodes]);

  // Close the node configuration panel
  const handleClosePanel = useCallback(() => {
    setShowNodePanel(false);
    setSelectedNode(null);
  }, []);

  // Create a new node from the node palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow/type');
      
      // Get node definition from registry
      const nodeDef = Object.values(nodeRegistry).find(def => def.type === nodeType);
      if (!nodeDef) return;

      // Get position where node was dropped
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create initial node data based on node definition
      const newNodeData: NodeData = {
        label: nodeDef.name,
        type: nodeDef.type,
        params: createDefaultParams(nodeDef),
      };

      // Create the new node
      const newNode: Node<NodeData> = {
        id: `${nodeType}-${uuidv4()}`,
        type: 'default',
        position,
        data: newNodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Helper to create default parameters for a new node
  const createDefaultParams = (nodeDef: NodeDefinition): Record<string, any> => {
    const params: Record<string, any> = {};
    
    // Set default values based on node type
    switch (nodeDef.type) {
      case 'input':
        params.query = 'Enter your query here';
        break;
      case 'prompt':
        params.template = nodeDef.template || '';
        params.llm = nodeDef.llm || { model: 'gpt-4', format: 'json_array' };
        params.fanOut = nodeDef.fanOut || false;
        break;
      case 'llm':
        params.model = nodeDef.llm?.model || 'gpt-4';
        params.temperature = nodeDef.llm?.temperature || 0.7;
        params.max_tokens = nodeDef.llm?.max_tokens || 1000;
        break;
      case 'summarizer':
        params.template = nodeDef.template || '';
        params.llm = nodeDef.llm || { 
          model: 'gpt-4', 
          temperature: 0.3, 
          max_tokens: 500 
        };
        break;
      case 'output':
        params.format = 'text';
        break;
      default:
        break;
    }
    
    return params;
  };

  // Export the current flow to JSON
  const handleExportFlow = () => {
    const jsonData = exportToJSON(nodes, edges);
    
    // Create a blob and download link
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'llm-pipeline.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Execute the current flow
  const handleExecuteFlow = () => {
    if (onExecute && reactFlowInstance) {
      const pipeline = exportToJSON(
        reactFlowInstance.getNodes(),
        reactFlowInstance.getEdges()
      );
      onExecute(pipeline);
    }
  };

  // Node palette items
  const nodePaletteItems = getAllNodeDefs().map(nodeDef => ({
    type: nodeDef.type,
    name: nodeDef.name,
    description: nodeDef.description
  }));

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <Background />
            
            {/* Node Palette */}
            <Panel position="top-left" style={{ background: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Node Palette</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {nodePaletteItems.map((item) => (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/reactflow/type', item.type);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    style={{
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'grab',
                      background: '#f5f5f5',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>{item.description}</div>
                  </div>
                ))}
              </div>
            </Panel>
            
            {/* Action Buttons */}
            <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
              <button
                className="execute-pipeline-button"
                onClick={handleExecuteFlow}
                style={{
                  padding: '8px 15px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Execute Pipeline
              </button>
              <button
                onClick={handleExportFlow}
                style={{
                  padding: '8px 15px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Export Pipeline
              </button>
            </Panel>
          </ReactFlow>
        </div>
        
        {/* Node Configuration Panel */}
        {showNodePanel && selectedNode && (
          <NodeConfigPanel
            selectedNode={selectedNode.data}
            onUpdateNode={handleUpdateNode}
            onClose={handleClosePanel}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default FlowCanvas;