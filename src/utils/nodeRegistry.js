// Import node definitions
// Using require instead of import for JSON files to avoid TypeScript issues
const InputNodeDef = require('../nodes/InputNode.json');
const PromptNodeDef = require('../nodes/PromptNode.json');
const LLMNodeDef = require('../nodes/LLMNode.json');
const SummarizerNodeDef = require('../nodes/SummarizerNode.json');
const OutputNodeDef = require('../nodes/OutputNode.json');

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