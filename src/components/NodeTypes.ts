// Node type definitions

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