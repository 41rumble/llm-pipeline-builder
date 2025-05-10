import type { NodeData } from './NodeTypes';

// Define our own NodeProps type since it's not directly exported from reactflow
export interface NodeProps<T = any> {
  id: string;
  type: string;
  data: T;
  selected: boolean;
  isConnectable: boolean;
  xPos: number;
  yPos: number;
  dragging: boolean;
  zIndex: number;
  targetPosition?: string;
  sourcePosition?: string;
}

// Extended NodeProps with our custom data
export type CustomNodeProps = NodeProps<NodeData>;