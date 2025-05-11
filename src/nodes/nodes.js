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
  template: `# MANDATORY INSTRUCTIONS FOR DETAILED EDUCATIONAL ARTICLE

You are writing a detailed, comprehensive educational article for a prestigious academic publication. This is a MINIMUM 2000-WORD assignment that MUST be completed in full.

## TOPIC
"{{originalQuery}}"

## SOURCE MATERIAL
You have access to the following expert information:

{{text}}

## CRITICAL REQUIREMENTS
1. Your article MUST be EXTREMELY DETAILED - minimum 2000 words
2. You MUST directly address "{{originalQuery}}" specifically
3. You MUST include ALL relevant information from the source material
4. You MUST add additional examples and explanations beyond the source material
5. You MUST use proper academic structure with clear headings and subheadings
6. You MUST write in an authoritative, educational tone
7. You MUST include specific examples for each main point
8. You MUST provide a thorough analysis of the topic

## STRICT PROHIBITIONS
- DO NOT write less than 2000 words
- DO NOT identify yourself as AI, language model, or assistant
- DO NOT apologize for limitations or lack of information
- DO NOT use phrases like "I cannot provide" or "I don't have specific information"
- DO NOT refer to "source material" or "expert answers" in your article
- DO NOT end with questions for the reader
- DO NOT provide a brief overview - this MUST be comprehensive

## REQUIRED ARTICLE STRUCTURE
Your article MUST follow this exact structure:

# {{originalQuery}}: A Comprehensive Analysis

## Introduction (250+ words)
[Thorough introduction to the topic that directly addresses the query]

## Historical Context and Background (350+ words)
[Detailed explanation of the historical development and background]

## Key Examples and Case Studies (400+ words)
[Specific examples and detailed case studies]

## Scientific Understanding and Mechanisms (400+ words)
[Detailed explanation of the scientific aspects and mechanisms]

## Comparative Analysis (300+ words)
[Compare and contrast different aspects or examples]

## Implications and Significance (300+ words)
[Detailed discussion of the broader implications and significance]

## Conclusion (200+ words)
[Comprehensive summary of all key points]

## References
[List of theoretical references that would support this article]

BEGIN YOUR COMPREHENSIVE 2000+ WORD ARTICLE NOW:`,
  llm: {
    model: "phi:latest",
    temperature: 0.1,
    max_tokens: 8000
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