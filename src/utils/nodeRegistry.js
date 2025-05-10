// Import node definitions from JavaScript file
import { 
  InputNodeDef, 
  PromptNodeDef, 
  LLMNodeDef, 
  SummarizerNodeDef, 
  OutputNodeDef 
} from '../nodes/nodes.js';

// Create a registry of all node definitions
const nodeRegistry = {
  [InputNodeDef.type]: InputNodeDef,
  [PromptNodeDef.type]: PromptNodeDef,
  [LLMNodeDef.type]: LLMNodeDef,
  [SummarizerNodeDef.type]: SummarizerNodeDef,
  [OutputNodeDef.type]: OutputNodeDef,
};

export default nodeRegistry;

// Helper function to get node definition by type
export const getNodeDefByType = (type) => {
  return Object.values(nodeRegistry).find(def => def.type === type);
};

// Helper function to get all node definitions
export const getAllNodeDefs = () => {
  return Object.values(nodeRegistry);
};