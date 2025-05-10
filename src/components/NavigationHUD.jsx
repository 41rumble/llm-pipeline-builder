import React, { useState, useEffect } from 'react';
import { useReactFlow, Panel } from 'reactflow';

/**
 * A navigation HUD component that shows the current viewport position
 * and provides quick navigation buttons
 */
const NavigationHUD = () => {
  const { getViewport, setViewport, fitView, getNodes } = useReactFlow();
  const [viewport, setViewportState] = useState({ x: 0, y: 0, zoom: 1 });
  const [showHUD, setShowHUD] = useState(false);
  
  // Update viewport state when it changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentViewport = getViewport();
      setViewportState(currentViewport);
      
      // Show HUD if there are nodes and they're outside the viewport
      const nodes = getNodes();
      if (nodes.length > 0) {
        // Check if any nodes are outside the visible area
        const visibleArea = {
          left: -currentViewport.x / currentViewport.zoom,
          top: -currentViewport.y / currentViewport.zoom,
          right: (-currentViewport.x + window.innerWidth) / currentViewport.zoom,
          bottom: (-currentViewport.y + window.innerHeight) / currentViewport.zoom
        };
        
        const anyNodesOutside = nodes.some(node => {
          return (
            node.position.x < visibleArea.left ||
            node.position.y < visibleArea.top ||
            node.position.x + (node.width || 150) > visibleArea.right ||
            node.position.y + (node.height || 40) > visibleArea.bottom
          );
        });
        
        setShowHUD(anyNodesOutside);
      } else {
        setShowHUD(false);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [getViewport, getNodes]);
  
  // Handle fit view button click
  const handleFitView = () => {
    fitView({ padding: 0.2 });
  };
  
  // Handle center view button click
  const handleCenterView = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };
  
  if (!showHUD) return null;
  
  return (
    <Panel position="top-right" className="navigation-hud">
      <div className="navigation-hud-content">
        <div className="navigation-hud-info">
          <span>Zoom: {viewport.zoom.toFixed(1)}x</span>
          <span>X: {Math.round(viewport.x)}</span>
          <span>Y: {Math.round(viewport.y)}</span>
        </div>
        <div className="navigation-hud-actions">
          <button 
            className="navigation-hud-button" 
            onClick={handleFitView}
            title="Fit all nodes in view"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
            Fit View
          </button>
          <button 
            className="navigation-hud-button" 
            onClick={handleCenterView}
            title="Reset view to center"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Center
          </button>
        </div>
      </div>
    </Panel>
  );
};

export default NavigationHUD;