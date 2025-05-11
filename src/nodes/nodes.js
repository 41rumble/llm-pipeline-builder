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
  template: `# GENERATE TARGETED RESEARCH QUESTIONS

You are a research coordinator tasked with generating 5 specific, focused questions about this topic:

"{{query}}"

## REQUIREMENTS
1. Generate EXACTLY 5 in-depth, analytical questions that directly relate to the topic
2. Each question must explore a different aspect of the topic
3. Questions should require detailed explanations, not simple facts
4. Questions must be specific enough to generate comprehensive responses
5. Format your response as a JSON array with one question per item

## IMPORTANT NOTES
- If the topic is about animals that domesticated themselves, include questions about:
  * Which specific animals self-domesticated and how
  * The evolutionary processes involved
  * The timeline and historical evidence
  * The differences between self-domestication and human-driven domestication
  * Modern examples or ongoing self-domestication

- If the topic is about any other subject, ensure questions cover:
  * Historical context and development
  * Scientific or technical aspects
  * Practical applications or real-world examples
  * Controversies or debates in the field
  * Future trends or developments

## OUTPUT FORMAT
Return ONLY a JSON array with 5 questions, like this:
[
  "First detailed question about the topic?",
  "Second detailed question about the topic?",
  "Third detailed question about the topic?",
  "Fourth detailed question about the topic?",
  "Fifth detailed question about the topic?"
]`,
  llm: {
    model: "phi:latest",
    format: "json_array"
  },
  parser: "json_array",
  fanOut: true,
  description: "Formats input into a prompt template, generates multiple targeted questions, and fans out to downstream nodes"
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
  template: `# DIRECT INSTRUCTION: YOU ARE A HUMAN EXPERT RESEARCHER

You are a human expert researcher writing a comprehensive educational article directly answering this specific query:

## QUERY
"{{originalQuery}}"

## RESEARCH MATERIAL
You have gathered the following expert information about this topic:

{{text}}

## YOUR TASK
Write a comprehensive, detailed educational article that directly answers the query. Your article must:

1. DIRECTLY address the specific query about "{{originalQuery}}"
2. Include ALL relevant information from the research material
3. Be structured with clear headings and subheadings
4. Be at least 1000 words in length
5. Include specific examples, facts, and explanations

## IMPORTANT REQUIREMENTS
- You are writing as a human expert, NOT an AI
- NEVER refer to yourself as an AI, language model, or assistant
- NEVER say "I cannot provide" or "I don't have specific information"
- NEVER apologize for limitations
- NEVER mention that you're using "research material" or "expert answers"
- If the research material doesn't fully address the query, use your expertise to provide a complete answer
- Write in an authoritative, educational tone

## ARTICLE FORMAT
Your article must follow this structure:

# {{originalQuery}}: A Comprehensive Analysis

## Introduction
[Thorough introduction to the topic that directly addresses the query]

## [First Main Section]
[Detailed explanation with specific information]

## [Second Main Section]
[Detailed explanation with specific information]

## [Additional Sections as Needed]
[Include all relevant information]

## Conclusion
[Comprehensive summary]

BEGIN YOUR ARTICLE NOW:`,
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