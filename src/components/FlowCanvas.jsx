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
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/base.css';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import BaseNode from './nodes/BaseNode';
import NodeConfigPanel from './NodeConfigPanel';
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
  
  // Context menu states
  const [contextMenu, setContextMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowNodePanel(true);
  }, []);

  // Handle edge connections
  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: ConnectionLineType.SmoothStep,
      animated: true,
    }, eds));
  }, [setEdges]);

  // Update node data when configuration changes
  const handleUpdateNode = useCallback((updatedData) => {
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

  // Handle right-click context menu
  const onContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      // Use the newer API to convert screen to flow position
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
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
  
  // Add keyboard shortcuts for panning
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!reactFlowInstance) return;
      
      const panAmount = 100;
      const currentViewport = reactFlowInstance.getViewport();
      
      switch (event.key) {
        case 'ArrowUp':
          reactFlowInstance.setViewport({ 
            ...currentViewport, 
            y: currentViewport.y + panAmount 
          });
          break;
        case 'ArrowDown':
          reactFlowInstance.setViewport({ 
            ...currentViewport, 
            y: currentViewport.y - panAmount 
          });
          break;
        case 'ArrowLeft':
          reactFlowInstance.setViewport({ 
            ...currentViewport, 
            x: currentViewport.x + panAmount 
          });
          break;
        case 'ArrowRight':
          reactFlowInstance.setViewport({ 
            ...currentViewport, 
            x: currentViewport.x - panAmount 
          });
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [reactFlowInstance]);
  
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
      
      // Create the new node with a good position
      const newNode = {
        id: `${nodeType}-${uuidv4()}`,
        type: 'default',
        position: getNewNodePosition(),
        data: newNodeData,
      };
      
      // Add the new node
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setContextMenu(null);
      
      // Manually position the viewport to show the new node
      if (reactFlowInstance) {
        // Use a timeout to ensure the node is added before adjusting the view
        setTimeout(() => {
          // Calculate a viewport that shows the new node
          const nodeX = newNode.position.x;
          const nodeY = newNode.position.y;
          
          // Set the viewport to center on the new node
          reactFlowInstance.setViewport({ 
            x: -nodeX + window.innerWidth / 4, 
            y: -nodeY + window.innerHeight / 4, 
            zoom: 1 
          });
        }, 50);
      }
    },
    [contextMenu, reactFlowInstance, setNodes, nodes]
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

      const nodeType = event.dataTransfer.getData('application/reactflow/type');
      
      // Get node definition from registry
      const nodeDef = Object.values(nodeRegistry).find(def => def.type === nodeType);
      if (!nodeDef) return;

      // Get position where node was dropped using the newer API
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create initial node data based on node definition
      const newNodeData = {
        label: nodeDef.name,
        type: nodeDef.type,
        params: createDefaultParams(nodeDef),
      };

      // Create the new node with a good position
      const newNode = {
        id: `${nodeType}-${uuidv4()}`,
        type: 'default',
        position: getNewNodePosition(),
        data: newNodeData,
      };

      // Add the new node
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      
      // Manually position the viewport to show the new node
      if (reactFlowInstance) {
        // Use a timeout to ensure the node is added before adjusting the view
        setTimeout(() => {
          // Calculate a viewport that shows the new node
          const nodeX = newNode.position.x;
          const nodeY = newNode.position.y;
          
          // Set the viewport to center on the new node
          reactFlowInstance.setViewport({ 
            x: -nodeX + window.innerWidth / 4, 
            y: -nodeY + window.innerHeight / 4, 
            zoom: 1 
          });
        }, 50);
      }
    },
    [reactFlowInstance, setNodes, nodes]
  );

  // Helper to calculate a good position for a new node
  const getNewNodePosition = () => {
    // If there are no nodes, start in the center
    if (nodes.length === 0) {
      return { x: 250, y: 100 };
    }
    
    // Find the rightmost node
    let maxX = 0;
    let avgY = 0;
    
    nodes.forEach(node => {
      maxX = Math.max(maxX, node.position.x);
      avgY += node.position.y;
    });
    
    // Calculate average Y position
    avgY = avgY / nodes.length;
    
    // Place new node to the right of existing nodes
    return { x: maxX + 300, y: avgY };
  };

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

  // Handle manual scrolling with mouse wheel
  const handleWheel = useCallback((event) => {
    if (!reactFlowInstance || event.ctrlKey || event.metaKey) return; // Let React Flow handle zooming
    
    event.preventDefault();
    
    const currentViewport = reactFlowInstance.getViewport();
    
    // Determine scroll direction and amount
    const scrollX = event.shiftKey ? event.deltaY : 0;
    const scrollY = !event.shiftKey ? event.deltaY : 0;
    
    // Update viewport
    reactFlowInstance.setViewport({
      x: currentViewport.x - scrollX,
      y: currentViewport.y - scrollY,
      zoom: currentViewport.zoom
    });
  }, [reactFlowInstance]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlowProvider>
        <div 
          ref={reactFlowWrapper} 
          style={{ width: '100%', height: '100%', display: 'flex', flex: 1 }}
          onWheel={handleWheel}>
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
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={4}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={false}
            panOnDrag={true}
            onlyRenderVisibleElements={false}
            attributionPosition="bottom-right"
          >
            <Controls showFitView={true} />
            <Background variant="dots" gap={12} size={1} />
            
            {/* Node Palette */}
            <Panel position="top-left">
              <div className="node-palette">
                <div className="node-palette-header">
                  <h3>Node Palette</h3>
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
              <div className="action-buttons">
                <button
                  className="action-button action-button-execute execute-pipeline-button"
                  onClick={handleExecuteFlow}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                  </svg>
                  Execute Pipeline
                </button>
                <button
                  className="action-button action-button-export"
                  onClick={handleExportFlow}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export Pipeline
                </button>
                <button
                  className="action-button"
                  style={{ backgroundColor: '#34344a' }}
                  onClick={() => {
                    if (reactFlowInstance) {
                      reactFlowInstance.fitView({ padding: 0.2 });
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 3V9H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 3V9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 21V15H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 21V15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Fit View
                </button>
              </div>
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
        
        {/* Context Menu */}
        {contextMenu && contextMenu.isOpen && (
          <div 
            className="context-menu"
            style={{
              position: 'fixed',
              top: menuPosition.y,
              left: menuPosition.x,
              zIndex: 1000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="context-menu-item context-menu-header" style={{ fontWeight: 'bold', borderBottom: '1px solid #3f3f5c', pointerEvents: 'none' }}>
              Add Node
            </div>
            {nodePaletteItems.map((item) => (
              <div 
                key={item.type}
                className="context-menu-item"
                onClick={() => createNodeFromContextMenu(item.type)}
              >
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: item.type === 'input' ? '#4285f4' : 
                                  item.type === 'prompt' ? '#5e72e4' : 
                                  item.type === 'llm' ? '#8b5cf6' : 
                                  item.type === 'summarizer' ? '#a78bfa' : 
                                  item.type === 'output' ? '#10b981' : '#a0a0b0'
                }}></div>
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