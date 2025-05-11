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
  template: `Generate 5 in-depth, analytical questions about the following topic. 
These questions should explore different aspects and require detailed explanations.
Return each question as a separate item in a JSON array:

Topic: {{query}}

Instructions:
1. Make questions specific and focused
2. Cover different aspects of the topic
3. Aim for questions that require explanatory answers, not simple facts
4. Format as a JSON array with one question per item
5. Do not include numbering in the questions themselves`,
  llm: {
    model: "phi:latest",
    format: "json_array"
  },
  parser: "json_array",
  fanOut: true,
  description: "Formats input into a prompt template, generates multiple in-depth questions, and fans out to downstream nodes"
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
  template: `# TASK: COMPREHENSIVE SYNTHESIS

## Original Query
"{{originalQuery}}"

## Multiple Expert Answers
Below are detailed answers to questions about this topic:

{{text}}

## Your Task
You are tasked with creating a comprehensive, detailed response to the original query by synthesizing all the information provided above.

1. Extract the key facts, concepts, and explanations from each answer
2. Organize this information into a coherent structure
3. Provide a thorough, well-articulated response that addresses all aspects of the query
4. Include specific details and examples from the answers
5. Ensure your response is accurate, complete, and informative

Your synthesis should be detailed and comprehensive, incorporating the valuable information from all the expert answers.`,
  llm: {
    model: "phi:latest",
    temperature: 0.3,
    max_tokens: 4000
  },
  description: "Aggregates multiple inputs and generates a comprehensive synthesis with the original query as context"
};

export const OutputNodeDef = {
  name: "OutputNode",
  type: "output",
  input: ["text"],
  output: [],
  description: "Final node in the pipeline, displays or exports the result"
};