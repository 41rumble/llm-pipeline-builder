import React, { useEffect, useState } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * A debug component that monitors node types and detects changes
 */
const NodeTypeDebugger = () => {
  const { getNodes } = useReactFlow();
  const [nodeTypes, setNodeTypes] = useState({});
  
  // Monitor node types
  useEffect(() => {
    const interval = setInterval(() => {
      const nodes = getNodes();
      const currentTypes = {};
      
      nodes.forEach(node => {
        const id = node.id;
        const type = node.data?.type;
        
        // If we have a record of this node's type
        if (nodeTypes[id] && nodeTypes[id] !== type) {
          console.error(`Node ${id} changed type from ${nodeTypes[id]} to ${type}`);
          
          // Fix the node type
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('fixNodeType', { 
              detail: { nodeId: id, correctType: nodeTypes[id] }
            }));
          }, 100);
        }
        
        currentTypes[id] = type;
      });
      
      setNodeTypes(currentTypes);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [getNodes, nodeTypes]);
  
  return null; // This component doesn't render anything
};

export default NodeTypeDebugger;