// Import node definitions
// Using require instead of import for JSON files to avoid TypeScript issues
const InputNodeDef = require('../nodes/InputNode.json');
const PromptNodeDef = require('../nodes/PromptNode.json');
const LLMNodeDef = require('../nodes/LLMNode.json');
const SummarizerNodeDef = require('../nodes/SummarizerNode.json');
const OutputNodeDef = require('../nodes/OutputNode.json');

// Define the NodeDefinition type
export interface NodeDefinition {
  name: string;
  type: string;
  input: string[];
  output: string[];
  description: string;
  template?: string;
  llm?: {
    model: string;
    format?: string;
    temperature?: number;
    max_tokens?: number;
  };
  parser?: string;
  fanOut?: boolean;
}

// Create a registry of all node definitions
const nodeRegistry: Record<string, NodeDefinition> = {
  [InputNodeDef.name]: InputNodeDef as NodeDefinition,
  [PromptNodeDef.name]: PromptNodeDef as NodeDefinition,
  [LLMNodeDef.name]: LLMNodeDef as NodeDefinition,
  [SummarizerNodeDef.name]: SummarizerNodeDef as NodeDefinition,
  [OutputNodeDef.name]: OutputNodeDef as NodeDefinition,
};

export default nodeRegistry;

// Helper function to get node definition by type
export const getNodeDefByType = (type: string): NodeDefinition | undefined => {
  return Object.values(nodeRegistry).find(def => def.type === type);
};

// Helper function to get all node definitions
export const getAllNodeDefs = (): NodeDefinition[] => {
  return Object.values(nodeRegistry);
};