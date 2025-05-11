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
  template: `Generate 5 questions about the following topic: {{query}}

Please return the questions as a JSON array.`,
  llm: {
    model: "phi:latest",
    format: "json_array"
  },
  parser: "json_array",
  fanOut: true,
  description: "Formats input into a prompt template, generates multiple questions, and fans out to downstream nodes"
};

export const RAGNodeDef = {
  name: "RAGNode",
  type: "rag",
  input: ["text"],
  output: ["text"],
  openwebui: {
    url: "http://localhost:8080",
    knowledgeBase: "",
    topK: 5,
    minScore: 0.7
  },
  template: `{{query}}

{{#if context}}
Context information:
{{context}}
{{/if}}`,
  description: "Retrieves relevant documents from OpenWebUI knowledge bases and adds them as context"
};

export const LLMNodeDef = {
  name: "LLMNode",
  type: "llm",
  input: ["text"],
  output: ["text"],
  llm: {
    model: "phi:latest",
    temperature: 0.7,
    max_tokens: 2000
  },
  description: "Sends text to an LLM and returns the response"
};

export const SummarizerNodeDef = {
  name: "SummarizerNode",
  type: "summarizer",
  input: ["text_list"],
  output: ["text"],
  template: `Please synthesize the following information to answer the query: "{{originalQuery}}"

Information to synthesize:
{{text}}

Please provide a comprehensive response that addresses the query based on the information provided.`,
  llm: {
    model: "phi:latest",
    temperature: 0.7,
    max_tokens: 2000
  },
  description: "Aggregates multiple inputs and generates a synthesis with the original query as context"
};

export const OutputNodeDef = {
  name: "OutputNode",
  type: "output",
  input: ["text"],
  output: [],
  description: "Final node in the pipeline, displays or exports the result"
};