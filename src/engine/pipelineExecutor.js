import { topologicalSort } from './topologicalSort';
import { callLLM } from './llmService';
import { parseResponseForFanOut } from './responseParser';
import Handlebars from 'handlebars';

/**
 * Main pipeline executor class
 */
export class PipelineExecutor {
  constructor(pipeline) {
    this.pipeline = pipeline;
    
    // Create a map of node IDs to nodes for quick lookup
    this.nodeMap = new Map();
    pipeline.nodes.forEach(node => {
      this.nodeMap.set(node.id, node);
    });
    
    // Create a map of source node IDs to target node IDs
    this.edgeMap = new Map();
    pipeline.edges.forEach(edge => {
      if (!this.edgeMap.has(edge.source)) {
        this.edgeMap.set(edge.source, []);
      }
      this.edgeMap.get(edge.source).push(edge.target);
    });
    
    // Determine the execution order using topological sort
    this.executionOrder = topologicalSort(pipeline);
    
    // Initialize state
    this.results = {};
    this.queue = [];
    this.fanOutTracking = {};
  }

  /**
   * Execute the pipeline with the given input
   */
  async execute(initialInput) {
    console.log('Starting pipeline execution with input:', initialInput);
    
    // Reset state
    this.results = {};
    this.queue = [];
    this.fanOutTracking = {};
    
    // Initialize global executing node ID and results
    window.executingNodeId = null;
    window.pipelineResults = {};
    
    // Find input nodes (nodes with no incoming edges)
    const inputNodes = this.executionOrder.filter(node => 
      !this.pipeline.edges.some(edge => edge.target === node.id)
    );
    
    // Start execution with input nodes
    for (const node of inputNodes) {
      this.queue.push({
        nodeId: node.id,
        context: {
          nodeResults: {},
          currentInput: initialInput
        }
      });
    }
    
    // Process the queue until empty
    while (this.queue.length > 0) {
      const { nodeId, context } = this.queue.shift();
      await this.executeNode(nodeId, context);
    }
    
    // Find output nodes (nodes with no outgoing edges)
    const outputNodes = this.executionOrder.filter(node => 
      !this.pipeline.edges.some(edge => edge.source === node.id)
    );
    
    // Clear the executing node ID
    window.executingNodeId = null;
    
    // Store all results in the global variable for node access
    window.pipelineResults = { ...this.results };
    
    // Trigger a custom event to notify nodes that results are available
    const resultsEvent = new CustomEvent('pipelineResultsUpdated', {
      detail: { results: window.pipelineResults }
    });
    window.dispatchEvent(resultsEvent);
    
    // Return results from output nodes
    if (outputNodes.length === 1) {
      return this.results[outputNodes[0].id];
    } else {
      return outputNodes.reduce((acc, node) => {
        acc[node.id] = this.results[node.id];
        return acc;
      }, {});
    }
  }

  /**
   * Execute a single node in the pipeline
   */
  async executeNode(nodeId, context) {
    const node = this.nodeMap.get(nodeId);
    if (!node) {
      throw new Error(`Node with ID ${nodeId} not found in the pipeline.`);
    }
    
    console.log(`Executing node: ${node.type} (${nodeId})`);
    
    // Emit an event to notify that this node is being executed
    this.emitNodeExecutionEvent(nodeId);
    
    // Set the global executing node ID for UI highlighting
    window.executingNodeId = nodeId;
    
    let result;
    
    // Execute the node based on its type
    switch (node.type) {
      case 'input':
        result = await this.executeInputNode(node, context);
        break;
      case 'prompt':
        result = await this.executePromptNode(node, context);
        break;
      case 'llm':
        result = await this.executeLLMNode(node, context);
        break;
      case 'summarizer':
        result = await this.executeSummarizerNode(node, context);
        break;
      case 'output':
        result = await this.executeOutputNode(node, context);
        break;
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
    
    // Store the result
    this.results[nodeId] = result;
    
    // Update the global results for node access
    window.pipelineResults = { ...window.pipelineResults, [nodeId]: result };
    
    // Emit an event to notify that this node's result is available
    const resultEvent = new CustomEvent('nodeResultAvailable', {
      detail: { nodeId, result }
    });
    window.dispatchEvent(resultEvent);
    
    // Update the context with the result
    const updatedContext = {
      nodeResults: { ...context.nodeResults, [nodeId]: result },
      currentInput: result
    };
    
    // Find downstream nodes
    const downstreamNodeIds = this.edgeMap.get(nodeId) || [];
    
    // Check if this node has fan-out enabled
    if (node.params.fanOut && Array.isArray(result)) {
      console.log(`Node ${nodeId} (${node.type}) is fanning out with ${result.length} items`);
      console.log(`Fan-out items: ${result.map(item => typeof item === 'string' ? item.substring(0, 50) + '...' : JSON.stringify(item).substring(0, 50) + '...').join(' | ')}`);
      
      // Store the original array result
      const originalResult = [...result];
      
      // For each downstream node, we need to track fan-out completion
      for (const targetId of downstreamNodeIds) {
        if (!this.fanOutTracking[targetId]) {
          this.fanOutTracking[targetId] = {
            expected: result.length,
            received: 0,
            results: [],
            sourceNodeId: nodeId,
            sourceNodeType: node.type
          };
          console.log(`Set up fan-out tracking for node ${targetId}, expecting ${result.length} results from ${node.type} node ${nodeId}`);
        }
      }
      
      // Fan out to downstream nodes - process each item individually
      for (let i = 0; i < result.length; i++) {
        // Create a unique context for this item
        const itemContext = {
          nodeResults: { 
            ...context.nodeResults, 
            [nodeId]: result[i],  // Store just this item as the node result
            [`${nodeId}_original`]: originalResult  // Also store the original array
          },
          currentInput: result[i],  // Set the current input to just this item
          fanOutIndex: i,  // Track which item in the fan-out this is
          fanOutTotal: result.length,  // Track total items in fan-out
          fanOutSourceNodeId: nodeId  // Track which node initiated the fan-out
        };
        
        console.log(`Creating fan-out context for item ${i+1}/${result.length}: ${typeof result[i] === 'string' ? result[i].substring(0, 50) + '...' : JSON.stringify(result[i]).substring(0, 50) + '...'}`);
        
        // Queue this item for processing by each downstream node
        for (const targetId of downstreamNodeIds) {
          const targetNode = this.nodeMap.get(targetId);
          console.log(`Queueing fan-out item ${i+1}/${result.length} for ${targetNode?.type} node ${targetId}`);
          
          this.queue.push({
            nodeId: targetId,
            context: itemContext
          });
        }
      }
      
      // Also store the fan-out results in a special format in the results
      this.results[`${nodeId}_fanout`] = result.map((item, index) => ({
        index,
        content: item
      }));
      
      // Update the global results
      window.pipelineResults[`${nodeId}_fanout`] = this.results[`${nodeId}_fanout`];
      
      // Emit an event for the fan-out results
      const fanOutEvent = new CustomEvent('nodeFanOutResults', {
        detail: { 
          nodeId, 
          results: this.results[`${nodeId}_fanout`] 
        }
      });
      window.dispatchEvent(fanOutEvent);
    } else {
      // Regular (non-fan-out) execution flow
      for (const targetId of downstreamNodeIds) {
        // Check if this is part of a fan-in
        if (this.fanOutTracking[targetId]) {
          const tracking = this.fanOutTracking[targetId];
          
          // Store the result with its fan-out index if available
          if (context.fanOutIndex !== undefined) {
            // If we have a fan-out index, store the result at that position
            tracking.results[context.fanOutIndex] = result;
          } else {
            // Otherwise just push to the end
            tracking.results.push(result);
          }
          
          tracking.received++;
          
          console.log(`Fan-in progress for node ${targetId}: received ${tracking.received}/${tracking.expected} results`);
          
          // If we've received all expected fan-out results, process the node with the collected results
          if (tracking.received === tracking.expected) {
            console.log(`Fan-in complete for node ${targetId} with ${tracking.results.length} results`);
            console.log(`Fan-in results: ${tracking.results.map(item => typeof item === 'string' ? item.substring(0, 50) + '...' : JSON.stringify(item).substring(0, 50) + '...').join(' | ')}`);
            
            // Get the original node results from the source node if available
            const sourceNodeResults = context.nodeResults[`${tracking.sourceNodeId}_original`] || [];
            
            const fanInContext = {
              nodeResults: { 
                ...context.nodeResults,
                // Add the source node's original array if available
                [tracking.sourceNodeId]: sourceNodeResults
              },
              currentInput: tracking.results,
              fanInCompleted: true,
              fanInSourceNodeId: tracking.sourceNodeId,
              fanInSourceNodeType: tracking.sourceNodeType
            };
            
            console.log(`Creating fan-in context for node ${targetId} with ${tracking.results.length} items`);
            
            // Store the fan-in results in a special format
            const fanInResultsId = `${targetId}_fanin`;
            this.results[fanInResultsId] = tracking.results.map((item, index) => ({
              index,
              content: item
            }));
            
            // Update the global results
            window.pipelineResults[fanInResultsId] = this.results[fanInResultsId];
            
            // Emit an event for the fan-in results
            const fanInEvent = new CustomEvent('nodeFanInResults', {
              detail: { 
                nodeId: targetId, 
                results: this.results[fanInResultsId],
                sourceNodeId: tracking.sourceNodeId
              }
            });
            window.dispatchEvent(fanInEvent);
            
            // Queue the node for processing with the collected results
            this.queue.push({
              nodeId: targetId,
              context: fanInContext
            });
            
            // Clear the tracking
            delete this.fanOutTracking[targetId];
          }
        } else {
          // Regular execution
          console.log(`Regular (non-fan) execution for node ${targetId}`);
          this.queue.push({
            nodeId: targetId,
            context: updatedContext
          });
        }
      }
    }
  }

  /**
   * Execute an input node
   */
  async executeInputNode(node, context) {
    // For input nodes, we just pass through the input or use the node's query parameter
    return node.params.query || context.currentInput;
  }

  /**
   * Execute a prompt node
   */
  async executePromptNode(node, context) {
    // Compile the template with Handlebars
    const template = Handlebars.compile(node.params.template);
    
    // Create template variables
    const templateVars = {
      query: context.currentInput,
      ...context.nodeResults
    };
    
    // Render the prompt
    const prompt = template(templateVars);
    
    // If this node has LLM configuration, call the LLM
    if (node.params.llm) {
      const response = await callLLM({
        model: node.params.llm.model,
        prompt,
        format: node.params.llm.format
      });
      
      // Parse the response if needed for fan-out
      if (node.params.fanOut) {
        // Use our enhanced response parser
        return parseResponseForFanOut(
          response.text, 
          node.params.parser || 'auto'
        );
      }
      
      return response.text;
    }
    
    // If no LLM, just return the formatted prompt
    return prompt;
  }

  /**
   * Execute an LLM node
   */
  async executeLLMNode(node, context) {
    // Add more detailed logging to track fan-out processing
    console.log(`Executing LLM node ${node.id} with model: ${node.params.model}`);
    console.log(`LLM input type: ${typeof context.currentInput}`);
    
    if (typeof context.currentInput === 'object') {
      console.log(`LLM input (object): ${JSON.stringify(context.currentInput).substring(0, 100)}...`);
    } else {
      console.log(`LLM input (first 100 chars): ${String(context.currentInput).substring(0, 100)}...`);
    }
    
    // Get the input text, ensuring we handle it as a string
    const inputText = context.currentInput;
    
    // Call the LLM with the input as the prompt
    try {
      // Create a unique identifier for this LLM call to track in logs
      const callId = `llm-${node.id}-${Date.now().toString(36)}`;
      console.log(`Starting LLM call ${callId}`);
      
      // Add a system prompt to encourage detailed responses
      const enhancedPrompt = `# EXPERT ANSWER REQUIRED

## Question
${typeof inputText === 'string' ? inputText : String(inputText)}

## Instructions
You are a subject matter expert tasked with providing a comprehensive, detailed answer to this question. Your response must be:

1. EXTREMELY THOROUGH - Cover all aspects of the topic in depth
2. WELL-STRUCTURED - Use clear organization with logical flow
3. DETAILED - Include specific facts, examples, and explanations
4. EDUCATIONAL - Explain concepts clearly as if teaching the topic
5. ACCURATE - Provide precise, factual information
6. COMPREHENSIVE - Aim for at least 300-500 words to fully address the question

Your goal is to create a response that would be suitable for an educational textbook or scholarly article on this topic. Do not leave any important aspects unexplained.

## Response Format
Structure your answer with:
- A clear introduction explaining the topic
- Multiple paragraphs covering different aspects
- Specific examples and details
- A conclusion summarizing key points

Begin your response immediately with the comprehensive answer:`;
      
      const response = await callLLM({
        model: node.params.model || "phi:latest", // Use a default model if none specified
        prompt: enhancedPrompt,
        temperature: node.params.temperature,
        max_tokens: node.params.max_tokens
      });
      
      console.log(`LLM call ${callId} completed, response length: ${response.text.length}`);
      
      // Log the complete LLM response for debugging
      console.log(`COMPLETE LLM RESPONSE for ${callId}:`);
      console.log(response.text);
      
      return response.text;
    } catch (error) {
      console.error("Error in LLM node:", error);
      return `Error calling LLM: ${error.message}`;
    }
  }

  /**
   * Execute a summarizer node
   */
  async executeSummarizerNode(node, context) {
    console.log(`Executing summarizer node ${node.id} with model: ${node.params.llm?.model}`);
    console.log(`Summarizer context: fanInCompleted=${context.fanInCompleted}, fanInSourceNodeId=${context.fanInSourceNodeId}`);
    
    // Get the input (should be an array from fan-out)
    let inputs = [];
    
    if (Array.isArray(context.currentInput)) {
      // Process each item in the array
      inputs = context.currentInput.map(item => {
        // If the item is an object with a 'content' property (from fan-in tracking),
        // extract just the content
        if (item && typeof item === 'object' && 'content' in item) {
          return item.content;
        }
        return item;
      });
    } else {
      inputs = [context.currentInput];
    }
    
    console.log(`Summarizer has ${inputs.length} inputs to process`);
    
    // Find the original query from the input node if available
    let originalQuery = null;
    const inputNodeResults = Object.entries(context.nodeResults)
      .find(([id, result]) => this.nodeMap.get(id)?.type === 'input');
    
    if (inputNodeResults) {
      originalQuery = inputNodeResults[1];
      console.log(`Found original query: ${originalQuery}`);
    }
    
    // If we have a fan-in source node, get its original results
    let sourceNodeResults = [];
    if (context.fanInSourceNodeId) {
      const sourceNodeId = context.fanInSourceNodeId;
      // Try to get the original array from the source node
      sourceNodeResults = context.nodeResults[sourceNodeId] || [];
      console.log(`Found source node ${sourceNodeId} with ${Array.isArray(sourceNodeResults) ? sourceNodeResults.length : 0} results`);
    }
    
    // Compile the template with Handlebars
    const template = Handlebars.compile(node.params.template);
    
    // Format each input with clear separation and numbering
    const formattedInputs = inputs.map((input, index) => {
      return `ANSWER ${index + 1}:\n${input}`;
    });
    
    // Join all inputs with clear separation
    const combinedText = formattedInputs.join('\n\n' + '-'.repeat(50) + '\n\n');
    
    // Create template variables with enhanced context
    const templateVars = {
      text: combinedText,
      combinedText: combinedText, // Add as a separate variable for template flexibility
      items: inputs,
      originalQuery: originalQuery,
      query: originalQuery, // For backward compatibility
      sourceItems: sourceNodeResults, // Add the source node's original items
      isFanIn: context.fanInCompleted || false,
      fanInSourceType: context.fanInSourceNodeType,
      ...context.nodeResults
    };
    
    // Log the complete template variables for debugging
    console.log('SUMMARIZER TEMPLATE VARIABLES:');
    console.log('originalQuery:', originalQuery);
    console.log('sourceItems:', JSON.stringify(sourceNodeResults, null, 2));
    console.log('items (inputs):', JSON.stringify(inputs, null, 2));
    
    // Render the prompt
    const prompt = template(templateVars);
    
    // Log the complete prompt for debugging
    console.log('COMPLETE SUMMARIZER PROMPT:');
    console.log(prompt);
    
    // Call the LLM
    try {
      const callId = `summarizer-${node.id}-${Date.now().toString(36)}`;
      console.log(`Starting summarizer LLM call ${callId}`);
      
      const response = await callLLM({
        model: node.params.llm?.model || "phi:latest", // Use a default model if none specified
        prompt,
        temperature: node.params.llm?.temperature,
        max_tokens: node.params.llm?.max_tokens
      });
      
      console.log(`Summarizer call ${callId} completed, response length: ${response.text.length}`);
      
      // Log the complete Summarizer response for debugging
      console.log(`COMPLETE SUMMARIZER RESPONSE for ${callId}:`);
      console.log(response.text);
      
      return response.text;
    } catch (error) {
      console.error("Error in summarizer node:", error);
      return `Error calling summarizer: ${error.message}`;
    }
  }

  /**
   * Execute an output node
   */
  async executeOutputNode(node, context) {
    // For output nodes, we just pass through the input
    return context.currentInput;
  }
  
  /**
   * Emit a custom event to notify that a node is being executed
   */
  emitNodeExecutionEvent(nodeId) {
    // Create and dispatch a custom event
    const event = new CustomEvent('nodeExecution', {
      detail: { nodeId }
    });
    
    // Dispatch the event
    window.dispatchEvent(event);
  }
}