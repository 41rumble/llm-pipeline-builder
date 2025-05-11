# LLM Pipeline Builder Integration with OpenWebUI

This directory contains examples and tools for integrating LLM Pipeline Builder with OpenWebUI.

## Pipeline Executor for OpenWebUI

The `openwebui_pipeline_executor.py` file is a custom OpenWebUI pipeline that allows you to load and execute pipelines created with LLM Pipeline Builder. It provides a simple interface for managing and running your pipelines directly from OpenWebUI.

### Features

- Load pipeline configurations from JSON files
- List available pipelines
- Execute pipelines with custom input
- Support for all node types from LLM Pipeline Builder
- Fallback to custom implementations for unsupported features

### Installation

1. Set up OpenWebUI Pipelines following the [official documentation](https://docs.openwebui.com/pipelines/).

2. Copy the `openwebui_pipeline_executor.py` file to your OpenWebUI Pipelines directory.

3. Create a `pipeline_configs` directory in the same location as the pipeline file, or set the `PIPELINES_DIR` environment variable to specify a different location.

4. Export your pipelines from LLM Pipeline Builder using the "Export for OpenWebUI" button and place the JSON files in the `pipeline_configs` directory.

### Usage

Once installed, you can interact with the pipeline executor through OpenWebUI's chat interface:

- To list available pipelines, send the message: `list pipelines`
- To run a pipeline, send the message: `run pipeline: <pipeline_name> with input: <your input>`

### Customization

The pipeline executor is designed to be extensible. You can modify the `_execute_node` method to add support for custom node types or to integrate with other OpenWebUI features.

## Implementation Details

The pipeline executor works by:

1. Loading all pipeline configurations from JSON files
2. Parsing user commands to determine which pipeline to run
3. Executing the pipeline by traversing the nodes and edges
4. Using OpenWebUI's built-in functionality where possible
5. Implementing custom logic for unsupported features

### Node Type Support

The current implementation provides basic support for the following node types:

- **Input**: Passes through the input text
- **Prompt**: Applies a template to the input
- **LLM**: Processes text with a language model
- **RAG**: Retrieves relevant documents from a knowledge base
- **Summarizer**: Summarizes text
- **Output**: Passes through the input text

### Future Improvements

- Add support for fan-out mode in prompt nodes
- Implement more sophisticated template rendering
- Add support for parallel execution of nodes
- Improve error handling and reporting
- Add a web interface for managing pipelines

## Contributing

Contributions to improve the pipeline executor are welcome! Please feel free to submit pull requests or open issues with suggestions for improvements.