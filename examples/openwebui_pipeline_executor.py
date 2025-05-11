"""
Pipeline Executor for LLM Pipeline Builder JSON format

This pipeline allows you to load and execute pipelines created with the LLM Pipeline Builder
in OpenWebUI. It supports loading pipeline configurations from JSON files and executing them
with OpenWebUI's built-in functionality where possible, falling back to custom implementations
where needed.
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

# Import OpenWebUI Pipelines components
from pipelines import Pipeline
from pipelines.schema import ChatMessage, ChatCompletionRequest, ChatCompletionResponse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Directory where pipeline JSON files are stored
PIPELINES_DIR = os.environ.get("PIPELINES_DIR", "./pipeline_configs")

class PipelineExecutorPipeline(Pipeline):
    """
    A pipeline that executes LLM Pipeline Builder JSON configurations.
    """
    
    def __init__(self):
        """Initialize the pipeline executor."""
        super().__init__()
        self.pipelines = self._load_pipelines()
        self.current_pipeline = None
    
    def _load_pipelines(self) -> Dict[str, Dict]:
        """
        Load all pipeline configurations from the pipelines directory.
        
        Returns:
            Dict[str, Dict]: A dictionary mapping pipeline names to their configurations.
        """
        pipelines = {}
        
        # Create the pipelines directory if it doesn't exist
        os.makedirs(PIPELINES_DIR, exist_ok=True)
        
        # Load all JSON files in the pipelines directory
        for file_path in Path(PIPELINES_DIR).glob("*.json"):
            try:
                with open(file_path, "r") as f:
                    pipeline_config = json.load(f)
                
                # Use the pipeline name or the filename as the key
                name = pipeline_config.get("name", file_path.stem)
                pipelines[name] = pipeline_config
                logger.info(f"Loaded pipeline: {name}")
            except Exception as e:
                logger.error(f"Error loading pipeline from {file_path}: {e}")
        
        return pipelines
    
    def _get_node_by_id(self, node_id: str) -> Optional[Dict]:
        """
        Get a node from the current pipeline by its ID.
        
        Args:
            node_id: The ID of the node to retrieve.
            
        Returns:
            The node configuration, or None if not found.
        """
        if not self.current_pipeline:
            return None
        
        for node in self.current_pipeline.get("nodes", []):
            if node.get("id") == node_id:
                return node
        
        return None
    
    def _get_connected_nodes(self, node_id: str) -> List[Dict]:
        """
        Get all nodes that are connected to the given node.
        
        Args:
            node_id: The ID of the node to find connections for.
            
        Returns:
            A list of connected node configurations.
        """
        if not self.current_pipeline:
            return []
        
        connected_nodes = []
        
        # Find all edges where the source is the given node
        for edge in self.current_pipeline.get("edges", []):
            if edge.get("source") == node_id:
                target_id = edge.get("target")
                target_node = self._get_node_by_id(target_id)
                if target_node:
                    connected_nodes.append(target_node)
        
        return connected_nodes
    
    def _find_input_nodes(self) -> List[Dict]:
        """
        Find all input nodes in the current pipeline.
        
        Returns:
            A list of input node configurations.
        """
        if not self.current_pipeline:
            return []
        
        return [node for node in self.current_pipeline.get("nodes", []) 
                if node.get("type") == "input"]
    
    def _execute_node(self, node: Dict, input_text: str, context: Dict) -> Any:
        """
        Execute a single node in the pipeline.
        
        Args:
            node: The node configuration.
            input_text: The input text for the node.
            context: The execution context.
            
        Returns:
            The output of the node.
        """
        node_type = node.get("type")
        node_params = node.get("params", {})
        
        if node_type == "input":
            # Input nodes just pass through the input
            return input_text
        
        elif node_type == "prompt":
            # Process prompt node
            template = node_params.get("template", "")
            # Simple template substitution
            prompt = template.replace("{{query}}", input_text)
            
            # If this node has LLM configuration, call the LLM
            if "llm" in node_params:
                # This would call the LLM in a real implementation
                # For now, we'll just return the prompt
                return prompt
            
            return prompt
        
        elif node_type == "llm":
            # Process LLM node
            # In a real implementation, this would call the LLM
            # For now, we'll just return a placeholder
            return f"LLM response to: {input_text}"
        
        elif node_type == "rag":
            # Process RAG node
            # In a real implementation, this would query the knowledge base
            # For now, we'll just return a placeholder
            return f"RAG enhanced: {input_text}"
        
        elif node_type == "summarizer":
            # Process summarizer node
            template = node_params.get("template", "")
            # Simple template substitution
            prompt = template.replace("{{text}}", input_text)
            
            # If this node has LLM configuration, call the LLM
            if "llm" in node_params:
                # This would call the LLM in a real implementation
                # For now, we'll just return the prompt
                return prompt
            
            return prompt
        
        elif node_type == "output":
            # Output nodes just pass through the input
            return input_text
        
        else:
            logger.warning(f"Unknown node type: {node_type}")
            return input_text
    
    def _execute_pipeline(self, pipeline_name: str, input_text: str) -> str:
        """
        Execute a pipeline with the given input.
        
        Args:
            pipeline_name: The name of the pipeline to execute.
            input_text: The input text for the pipeline.
            
        Returns:
            The output of the pipeline.
        """
        if pipeline_name not in self.pipelines:
            return f"Error: Pipeline '{pipeline_name}' not found."
        
        self.current_pipeline = self.pipelines[pipeline_name]
        
        # Find input nodes
        input_nodes = self._find_input_nodes()
        if not input_nodes:
            return "Error: No input nodes found in the pipeline."
        
        # Start with the first input node
        current_node = input_nodes[0]
        context = {}
        current_output = input_text
        
        # Keep track of visited nodes to avoid cycles
        visited = set()
        
        # Execute the pipeline
        while current_node and current_node["id"] not in visited:
            visited.add(current_node["id"])
            
            # Execute the current node
            current_output = self._execute_node(current_node, current_output, context)
            
            # Find the next node
            connected_nodes = self._get_connected_nodes(current_node["id"])
            current_node = connected_nodes[0] if connected_nodes else None
        
        return current_output
    
    def _list_available_pipelines(self) -> str:
        """
        List all available pipelines.
        
        Returns:
            A formatted string listing all available pipelines.
        """
        if not self.pipelines:
            return "No pipelines available. Upload JSON pipeline configurations to the pipeline_configs directory."
        
        result = "Available pipelines:\n\n"
        for name, pipeline in self.pipelines.items():
            description = pipeline.get("description", "No description")
            result += f"- **{name}**: {description}\n"
        
        result += "\nTo run a pipeline, use: `run pipeline: <pipeline_name> with input: <your input>`"
        return result
    
    def _process_command(self, message: str) -> str:
        """
        Process a command from the user.
        
        Args:
            message: The user's message.
            
        Returns:
            The response to the command.
        """
        # Check if the message is a command to run a pipeline
        if "run pipeline:" in message.lower():
            try:
                # Extract the pipeline name and input
                parts = message.split("with input:", 1)
                pipeline_part = parts[0].split("run pipeline:", 1)[1].strip()
                input_text = parts[1].strip() if len(parts) > 1 else ""
                
                # Execute the pipeline
                return self._execute_pipeline(pipeline_part, input_text)
            except Exception as e:
                logger.error(f"Error executing pipeline: {e}")
                return f"Error executing pipeline: {str(e)}"
        
        # Check if the message is a command to list pipelines
        elif "list pipelines" in message.lower():
            return self._list_available_pipelines()
        
        # If it's not a recognized command, provide help
        else:
            return (
                "Pipeline Executor Commands:\n\n"
                "- `list pipelines`: List all available pipelines\n"
                "- `run pipeline: <pipeline_name> with input: <your input>`: Run a specific pipeline\n\n"
                "To add new pipelines, export them from LLM Pipeline Builder and place the JSON files in the pipeline_configs directory."
            )
    
    async def process_chat_completion(
        self, request: ChatCompletionRequest
    ) -> ChatCompletionResponse:
        """
        Process a chat completion request.
        
        Args:
            request: The chat completion request.
            
        Returns:
            The chat completion response.
        """
        # Extract the user's message
        user_message = None
        for message in request.messages:
            if message.role == "user":
                user_message = message.content
                break
        
        if not user_message:
            response_content = "No user message found in the request."
        else:
            # Process the user's message
            response_content = self._process_command(user_message)
        
        # Create the response
        response = ChatCompletionResponse(
            id="pipeline-executor",
            object="chat.completion",
            created=0,
            model="pipeline-executor",
            choices=[
                {
                    "index": 0,
                    "message": ChatMessage(
                        role="assistant",
                        content=response_content,
                    ),
                    "finish_reason": "stop",
                }
            ],
        )
        
        return response

# Create an instance of the pipeline
pipeline = PipelineExecutorPipeline()