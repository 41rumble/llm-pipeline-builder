import { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ConnectionLineType,
  Panel,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/base.css';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import BaseNode from './nodes/BaseNode';
import NodeConfigPanel from './NodeConfigPanel';
import NodeTypeDebugger from './NodeTypeDebugger';
import NavigationHUD from './NavigationHUD';
import nodeRegistry, { getAllNodeDefs } from '../utils/nodeRegistry';
import { exportToJSON } from '../utils/exportUtils';

// Define the node types for React Flow
const nodeTypes = {
  default: BaseNode,
};

const FlowCanvas = ({ onExecute }) => {
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // UI states
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Execution states
  const [executingNodeId, setExecutingNodeId] = useState(null);
  
  // Make executingNodeId available globally for node highlighting
  useEffect(() => {
    window.executingNodeId = executingNodeId;
  }, [executingNodeId]);
  
  // Add a listener to fix node types when they change unexpectedly
  useEffect(() => {
    const handleFixNodeType = (event) => {
      const { nodeId, correctType } = event.detail;
      console.log(`Fixing node ${nodeId} type to ${correctType}`);
      
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === nodeId && node.data.type !== correctType) {
            // Create a deep copy of the node data
            const fixedData = JSON.parse(JSON.stringify(node.data));
            // Fix the type
            fixedData.type = correctType;
            
            return {
              ...node,
              data: fixedData
            };
          }
          return node;
        })
      );
    };
    
    window.addEventListener('fixNodeType', handleFixNodeType);
    return () => window.removeEventListener('fixNodeType', handleFixNodeType);
  }, [setNodes]);
  
  // Context menu states
  const [contextMenu, setContextMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    console.log('Raw node selected:', node.id, 'Type:', node.data?.type);
    
    // Don't create a deep copy, just use the node directly
    setSelectedNode(node);
    setShowNodePanel(true);
  }, []);
  
  // Handle background click to deselect nodes
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowNodePanel(false);
  }, []);

  // Handle edge connections
  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: ConnectionLineType.SmoothStep,
      animated: true,
    }, eds));
  }, [setEdges]);
  
  // Handle right-click context menu
  const onContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      setMenuPosition({ x: event.clientX, y: event.clientY });
      setContextMenu({
        position,
        isOpen: true
      });
    },
    [reactFlowInstance]
  );
  
  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };
    
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Update node data when configuration changes
  const handleUpdateNode = useCallback((updatedData) => {
    if (!selectedNode) return;
    
    console.log('Updating node:', selectedNode.id, 'Type:', updatedData.type || selectedNode.data.type);
    
    // Store the update for debugging
    window._lastNodeUpdate = {
      selectedNode,
      updatedData
    };
    
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          // Create a new data object that preserves the node type
          const newData = {
            ...updatedData,
            type: selectedNode.data.type,
            label: selectedNode.data.label
          };
          
          return {
            ...node,
            data: newData
          };
        }
        return node;
      })
    );
  }, [selectedNode, setNodes]);

  // Close the node configuration panel
  const handleClosePanel = useCallback(() => {
    // The panel will auto-save changes when it unmounts
    setShowNodePanel(false);
    setSelectedNode(null);
  }, []);
  
  // Create a new node from context menu
  const createNodeFromContextMenu = useCallback(
    (nodeType) => {
      if (!contextMenu || !reactFlowInstance) return;
      
      // Get node definition from registry
      const nodeDef = Object.values(nodeRegistry).find(def => def.type === nodeType);
      if (!nodeDef) return;
      
      // Create initial node data based on node definition
      const newNodeData = {
        label: nodeDef.name,
        type: nodeDef.type,
        params: createDefaultParams(nodeDef),
      };
      
      // Create the new node
      const newNode = {
        id: `${nodeType}-${uuidv4()}`,
        type: 'default',
        position: contextMenu.position,
        data: newNodeData,
      };
      
      // Add the new node
      setNodes((nds) => nds.concat(newNode));
      setContextMenu(null);
    },
    [contextMenu, reactFlowInstance, setNodes]
  );

  // Create a new node from the node palette
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
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
      const newNodeData = {
        label: nodeDef.name,
        type: nodeDef.type,
        params: createDefaultParams(nodeDef),
      };

      // Create the new node
      const newNode = {
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
  const createDefaultParams = (nodeDef) => {
    const params = {};
    
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
  const handleExecuteFlow = async () => {
    if (onExecute && reactFlowInstance) {
      // Clear any previous executing node highlight
      setExecutingNodeId(null);
      
      const pipeline = exportToJSON(
        reactFlowInstance.getNodes(),
        reactFlowInstance.getEdges()
      );
      
      // Create a modified version of onExecute that tracks node execution
      const executeWithTracking = async (pipelineData) => {
        try {
          // Set up a listener for node execution events
          window.addEventListener('nodeExecution', (event) => {
            if (event.detail && event.detail.nodeId) {
              setExecutingNodeId(event.detail.nodeId);
            }
          }, { once: false });
          
          // Execute the pipeline
          const result = await onExecute(pipelineData);
          
          // Clear executing node highlight when done
          setExecutingNodeId(null);
          
          return result;
        } catch (error) {
          // Clear executing node highlight on error
          setExecutingNodeId(null);
          throw error;
        }
      };
      
      return executeWithTracking(pipeline);
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
            onContextMenu={onContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            attributionPosition="bottom-right"
          >
            <Controls showFitView={true} />
            <Background variant="dots" gap={12} size={1} />
            <MiniMap 
              nodeStrokeColor="#3f3f5c"
              nodeColor="#2a2a3c"
              nodeBorderRadius={2}
              maskColor="rgba(30, 30, 46, 0.5)"
              style={{ 
                position: 'absolute', 
                bottom: 10, 
                right: 10,
                backgroundColor: '#1e1e2e',
                border: '1px solid #3f3f5c',
                borderRadius: '4px'
              }}
            />
            <NavigationHUD />
            <NodeTypeDebugger />
            
            {/* Node Palette */}
            <Panel position="top-left">
              <div className="node-palette">
                <div className="node-palette-header">
                  <h3 className="node-palette-title">Node Palette</h3>
                </div>
                <div className="node-palette-content">
                  {nodePaletteItems.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow/type', item.type);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`node-palette-item node-palette-item-${item.type}`}
                    >
                      <div className="node-palette-item-title">{item.name}</div>
                      <div className="node-palette-item-description">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            
            {/* Action Buttons */}
            <Panel position="top-right">
              <div className="flex gap-2">
                <button
                  className="btn btn-primary execute-pipeline-button"
                  onClick={handleExecuteFlow}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                  </svg>
                  Execute Pipeline
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleExportFlow}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export Pipeline
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </div>
        
        {/* Node Configuration Panel */}
        {console.log('Panel state:', { showNodePanel, selectedNode })}
        {showNodePanel && selectedNode && (
          <div className="panel-container">
            <div className="panel-overlay" onClick={handleClosePanel}></div>
            <NodeConfigPanel
              selectedNode={selectedNode.data}
              onUpdateNode={handleUpdateNode}
              onClose={handleClosePanel}
            />
          </div>
        )}
        
        {/* Context Menu */}
        {contextMenu && contextMenu.isOpen && (
          <div 
            className="context-menu"
            style={{
              top: menuPosition.y,
              left: menuPosition.x
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="context-menu-header">
              Add Node
            </div>
            {nodePaletteItems.map((item) => (
              <div 
                key={item.type}
                className="context-menu-item"
                onClick={() => createNodeFromContextMenu(item.type)}
              >
                <div 
                  className="context-menu-item-indicator"
                  style={{ 
                    backgroundColor: item.type === 'input' ? '#3b82f6' : 
                                    item.type === 'prompt' ? '#6366f1' : 
                                    item.type === 'llm' ? '#8b5cf6' : 
                                    item.type === 'summarizer' ? '#a78bfa' : 
                                    item.type === 'output' ? '#10b981' : '#64748b'
                  }}
                ></div>
                {item.name}
              </div>
            ))}
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default FlowCanvas;