// Define all node types directly in JavaScript

export const InputNodeDef = {
  name: "InputNode",
  type: "input",
  input: [],
  output: ["text"],
  description: "Starting point for the pipeline, provides initial input"
};

export const PromptNodeDef = {
  name: "PromptNode",
  type: "prompt",
  input: ["text"],
  output: ["text_list"],
  template: "Generate 5 detailed questions about the following topic. Return each question as a separate item in a JSON array:\n\n{{query}}",
  llm: {
    model: "gpt-4",
    format: "json_array"
  },
  parser: "json_array",
  fanOut: true,
  description: "Formats input into a prompt template, generates multiple questions, and fans out to downstream nodes"
};

export const LLMNodeDef = {
  name: "LLMNode",
  type: "llm",
  input: ["text"],
  output: ["text"],
  llm: {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 1000
  },
  description: "Sends text to an LLM and returns the response"
};

export const SummarizerNodeDef = {
  name: "SummarizerNode",
  type: "summarizer",
  input: ["text_list"],
  output: ["text"],
  template: "The original query was: {{originalQuery}}\n\nBased on the following responses to questions about this query, provide a comprehensive answer that synthesizes all the information:\n\n{{text}}",
  llm: {
    model: "gpt-4",
    temperature: 0.3,
    max_tokens: 500
  },
  description: "Aggregates multiple inputs and generates a summary with the original query as context"
};

export const OutputNodeDef = {
  name: "OutputNode",
  type: "output",
  input: ["text"],
  output: [],
  description: "Final node in the pipeline, displays or exports the result"
};