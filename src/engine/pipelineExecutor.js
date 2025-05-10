import { topologicalSort } from './topologicalSort';
import { callLLM } from './llmService';
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
    
    // Initialize global executing node ID
    window.executingNodeId = null;
    
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
    
    // Update the context with the result
    const updatedContext = {
      nodeResults: { ...context.nodeResults, [nodeId]: result },
      currentInput: result
    };
    
    // Find downstream nodes
    const downstreamNodeIds = this.edgeMap.get(nodeId) || [];
    
    // Check if this node has fan-out enabled
    if (node.params.fanOut && Array.isArray(result)) {
      console.log(`Node ${nodeId} is fanning out with ${result.length} items`);
      
      // For each downstream node, we need to track fan-out completion
      for (const targetId of downstreamNodeIds) {
        if (!this.fanOutTracking[targetId]) {
          this.fanOutTracking[targetId] = {
            expected: result.length,
            received: 0,
            results: []
          };
        }
      }
      
      // Fan out to downstream nodes
      for (let i = 0; i < result.length; i++) {
        const itemContext = {
          nodeResults: { ...context.nodeResults, [nodeId]: result[i] },
          currentInput: result[i]
        };
        
        for (const targetId of downstreamNodeIds) {
          this.queue.push({
            nodeId: targetId,
            context: itemContext
          });
        }
      }
    } else {
      // Regular (non-fan-out) execution flow
      for (const targetId of downstreamNodeIds) {
        // Check if this is part of a fan-in
        if (this.fanOutTracking[targetId]) {
          const tracking = this.fanOutTracking[targetId];
          tracking.results.push(result);
          tracking.received++;
          
          // If we've received all expected fan-out results, process the node with the collected results
          if (tracking.received === tracking.expected) {
            console.log(`Fan-in complete for node ${targetId} with ${tracking.results.length} results`);
            
            const fanInContext = {
              nodeResults: { ...context.nodeResults },
              currentInput: tracking.results
            };
            
            this.queue.push({
              nodeId: targetId,
              context: fanInContext
            });
            
            // Clear the tracking
            delete this.fanOutTracking[targetId];
          }
        } else {
          // Regular execution
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
      
      // Parse the response if needed
      if (node.params.parser === 'json_array' && node.params.fanOut) {
        try {
          // Try to find JSON array in the response
          const text = response.text;
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          
          if (jsonMatch) {
            // If we found a JSON array pattern, try to parse it
            return JSON.parse(jsonMatch[0]);
          } else {
            // If no JSON array pattern found, try to parse the whole text
            return JSON.parse(text);
          }
        } catch (error) {
          console.error('Failed to parse JSON array response:', error);
          console.log('Response text:', response.text);
          
          // If parsing fails, try to split the text into an array
          // This is a fallback for when Ollama doesn't return proper JSON
          const lines = response.text
            .split(/\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('[') && !line.startsWith(']'));
            
          if (lines.length > 0) {
            // Clean up lines (remove numbers, quotes, etc.)
            const cleanedLines = lines.map(line => {
              return line
                .replace(/^\d+[\.\)\-]\s*/, '') // Remove list markers like "1. " or "- "
                .replace(/^["']|["']$/g, '')    // Remove quotes at start/end
                .trim();
            }).filter(line => line.length > 0);
            
            if (cleanedLines.length > 0) {
              return cleanedLines;
            }
          }
          
          // Last resort fallback
          return [response.text]; 
        }
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
    console.log(`Executing LLM node with model: ${node.params.model}`);
    
    // Make sure we have a valid input
    const inputText = typeof context.currentInput === 'string' 
      ? context.currentInput 
      : JSON.stringify(context.currentInput);
    
    // Call the LLM with the input as the prompt
    try {
      const response = await callLLM({
        model: node.params.model || "phi:latest", // Use a default model if none specified
        prompt: inputText,
        temperature: node.params.temperature,
        max_tokens: node.params.max_tokens
      });
      
      console.log(`LLM response received, length: ${response.text.length}`);
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
    console.log(`Executing summarizer node with model: ${node.params.llm?.model}`);
    
    // Get the input (should be an array from fan-out)
    const inputs = Array.isArray(context.currentInput) 
      ? context.currentInput 
      : [context.currentInput];
    
    // Compile the template with Handlebars
    const template = Handlebars.compile(node.params.template);
    
    // Create template variables
    const templateVars = {
      text: inputs.join('\n\n'),
      items: inputs,
      ...context.nodeResults
    };
    
    // Render the prompt
    const prompt = template(templateVars);
    
    // Call the LLM
    try {
      const response = await callLLM({
        model: node.params.llm?.model || "phi:latest", // Use a default model if none specified
        prompt,
        temperature: node.params.llm?.temperature,
        max_tokens: node.params.llm?.max_tokens
      });
      
      console.log(`Summarizer response received, length: ${response.text.length}`);
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