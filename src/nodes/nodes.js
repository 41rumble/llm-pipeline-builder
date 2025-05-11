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
  template: `# COMPREHENSIVE SYNTHESIS TASK

You are an expert research assistant tasked with creating a detailed, thorough response to the following query by synthesizing information from multiple expert answers.

## ORIGINAL QUERY
"{{originalQuery}}"

## EXPERT ANSWERS
{{text}}

## YOUR TASK
Create a comprehensive, detailed explanation that fully answers the original query by synthesizing ALL information from the expert answers above.

## REQUIREMENTS
1. Your response must be at least 500 words and extremely detailed
2. Extract and include ALL key information from EACH expert answer
3. Organize the information into a coherent, logical structure with clear sections
4. Include specific details, examples, and explanations from the source material
5. Provide thorough analysis that covers all aspects of the topic
6. Use headings and subheadings to organize your response
7. End with a conclusion that summarizes the key points

## IMPORTANT NOTES
- Do NOT simply summarize or provide a brief overview
- Your response should be comprehensive and include ALL relevant information
- Do NOT add any disclaimers or notes about the information provided
- Write as if you are the definitive expert on this topic

## RESPONSE FORMAT
Your response should follow this structure:

# Comprehensive Answer: [Query Topic]

## Introduction
[Thorough introduction to the topic]

## [Main Section 1]
[Detailed explanation with specific information]

## [Main Section 2]
[Detailed explanation with specific information]

[Additional sections as needed]

## Conclusion
[Comprehensive summary of key points]

Now, provide your comprehensive response:`,
  llm: {
    model: "phi:latest",
    temperature: 0.2,
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