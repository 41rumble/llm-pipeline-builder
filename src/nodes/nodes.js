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
  template: `# CRITICAL INSTRUCTION: GENERATE COMPLETE COMPREHENSIVE RESPONSE

You are tasked with creating a COMPLETE, DETAILED, and COMPREHENSIVE response to the query below.

## QUERY TO ANSWER
"{{originalQuery}}"

## SOURCE MATERIAL
I have collected expert answers to questions about this topic. Use ALL of this information to create your response:

{{text}}

## CRITICAL INSTRUCTIONS
1. Your response MUST be COMPLETE and COMPREHENSIVE - at least 800-1000 words
2. You MUST include ALL key information from the source material
3. You MUST organize your response with clear headings and subheadings
4. You MUST provide specific details, examples, and explanations
5. You MUST write as if creating an authoritative educational resource on this topic

## WARNING
- DO NOT generate only a conclusion or summary
- DO NOT end with phrases like "I hope this helps" or "Do you have any questions?"
- DO NOT skip any important information from the source material
- Your response MUST be COMPLETE with introduction, body sections, and conclusion

## REQUIRED RESPONSE FORMAT
Your response MUST follow this exact structure:

# Complete Answer: {{originalQuery}}

## Introduction
[Write a thorough introduction to the topic - minimum 100 words]

## [First Main Topic]
[Detailed explanation with specific information - minimum 200 words]

## [Second Main Topic]
[Detailed explanation with specific information - minimum 200 words]

## [Additional Sections as Needed]
[Include all relevant information from source material]

## Conclusion
[Comprehensive summary of key points - minimum 100 words]

BEGIN YOUR COMPLETE RESPONSE NOW:`,
  llm: {
    model: "phi:latest",
    temperature: 0.1,
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