import React from 'react';
import Draggable from 'react-draggable';
import NodeConfigPanel from './NodeConfigPanel';

const DraggableNodeConfigPanel = (props) => {
  return (
    <Draggable
      handle=".node-config-header"
      bounds="parent"
      defaultPosition={{x: 20, y: 20}}
    >
      <div className="draggable-panel-container">
        <NodeConfigPanel {...props} />
      </div>
    </Draggable>
  );
};

export default DraggableNodeConfigPanel;