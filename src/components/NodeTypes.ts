import type { Node } from 'reactflow';

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

// Define the data structure for each node type
export interface BaseNodeData {
  label: string;
  type: string;
  params: Record<string, any>;
}

export interface InputNodeData extends BaseNodeData {
  params: {
    query: string;
  };
}

export interface PromptNodeData extends BaseNodeData {
  params: {
    template: string;
    llm: {
      model: string;
      format: string;
    };
    fanOut: boolean;
  };
}

export interface LLMNodeData extends BaseNodeData {
  params: {
    model: string;
    temperature: number;
    max_tokens: number;
  };
}

export interface SummarizerNodeData extends BaseNodeData {
  params: {
    template: string;
    llm: {
      model: string;
      temperature: number;
      max_tokens: number;
    };
  };
}

export interface OutputNodeData extends BaseNodeData {
  params: {
    format: string;
  };
}

// Union type for all node data types
export type NodeData = 
  | InputNodeData 
  | PromptNodeData 
  | LLMNodeData 
  | SummarizerNodeData 
  | OutputNodeData;

// Extended NodeProps with our custom data
export type CustomNodeProps = NodeProps<NodeData>;