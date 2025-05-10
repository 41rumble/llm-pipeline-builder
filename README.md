# LLM Pipeline Builder

A visual tool for building, configuring, and executing LLM pipelines using React Flow.

## Features

- **Visual Pipeline Builder**: Drag and drop interface to create complex LLM pipelines
- **Node Configuration**: Customize prompts, LLM parameters, and execution flow
- **Fan-out/Fan-in Support**: Split processing into parallel paths and merge results
- **Pipeline Export**: Export your pipeline as JSON for sharing or saving
- **Pipeline Execution**: Run your pipeline directly in the browser
- **Extensible Node System**: Easy to add new node types

## Node Types

- **Input Node**: Starting point for the pipeline, provides initial input
- **Prompt Node**: Formats input into a prompt template and sends to LLM
- **LLM Node**: Sends text to an LLM and returns the response
- **Summarizer Node**: Aggregates multiple inputs and generates a summary
- **Output Node**: Final node in the pipeline, displays or exports the result

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the displayed URL

## Building a Pipeline

1. Drag nodes from the palette on the left to the canvas
2. Connect nodes by dragging from one node's output handle to another node's input handle
3. Click on a node to configure its parameters
4. Use the "Execute Pipeline" button to run your pipeline
5. Use the "Export Pipeline" button to save your pipeline as JSON

## Pipeline Execution

The execution engine processes nodes in topological order, ensuring that each node's dependencies are processed before the node itself. The engine supports:

- **Fan-out**: A node can produce multiple outputs that are processed in parallel
- **Fan-in**: Multiple outputs can be aggregated into a single node
- **Templating**: Handlebars templates for dynamic prompt generation
- **LLM Integration**: Support for multiple LLM providers

## Technologies Used

- React + TypeScript
- React Flow for the visual editor
- Zustand for state management
- Handlebars for templating

## License

MIT
