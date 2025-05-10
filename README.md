# LLM Pipeline Builder

A visual tool for creating, configuring, and executing LLM (Large Language Model) pipelines with a node-based interface.

![LLM Pipeline Builder](https://github.com/41rumble/llm-pipeline-builder/raw/main/docs/images/pipeline-builder-screenshot.png)

## Overview

LLM Pipeline Builder is a React-based application that allows you to visually create and execute complex LLM workflows. It provides a node-based interface where you can connect different components (like input nodes, prompt templates, LLM calls, and output processors) to create sophisticated AI pipelines.

The application consists of three main components:

1. **Visual Builder**: A React Flow-based UI for creating and configuring pipelines
2. **Pipeline Schema**: A JSON format that defines node types, inputs, outputs, and runtime behaviors
3. **Execution Engine**: A JavaScript module that interprets the pipeline and executes the LLM operations

## Features

### Implemented Features

- **Visual Node Editor**
  - Drag-and-drop interface for creating pipelines
  - Connect nodes with edges to define data flow
  - Select and configure nodes with a dedicated panel
  - Delete nodes and connections
  - Pan and zoom the canvas

- **Node Types**
  - **Input Node**: Define input data for the pipeline
  - **Prompt Node**: Create prompt templates with Handlebars syntax
  - **LLM Node**: Send prompts to language models and get responses
  - **Summarizer Node**: Aggregate and process multiple inputs
  - **Output Node**: Display final results

- **Pipeline Execution**
  - Execute the entire pipeline with a single click
  - View execution results in real-time
  - Visual feedback showing which node is currently executing
  - Error handling for failed executions

- **LLM Integration**
  - Connect to Ollama for local LLM execution
  - Model selection from available Ollama models
  - Configurable parameters (temperature, max tokens)

- **Advanced Features**
  - Fan-out capability for processing multiple items in parallel
  - JSON response parsing for structured outputs
  - Pipeline export to JSON format
  - Navigation aids for large pipelines (minimap, navigation HUD)

### In Progress / Planned Features

- **Pipeline Management**
  - Save and load pipelines from local storage
  - Import/export pipelines as JSON files
  - Pipeline templates for common use cases

- **Enhanced Execution**
  - Step-by-step debugging
  - Execution history and result comparison
  - Conditional routing based on LLM outputs
  - Looping and recursion capabilities

- **Advanced LLM Integration**
  - Support for OpenAI API
  - Support for other LLM providers (Anthropic, Cohere, etc.)
  - Streaming responses for real-time feedback
  - Model parameter optimization

- **Collaboration Features**
  - Share pipelines with others
  - Collaborative editing
  - Version control for pipelines

- **UI Enhancements**
  - Dark/light theme toggle
  - Customizable node appearance
  - Keyboard shortcuts for common actions
  - Mobile-responsive design

## Technical Architecture

### Frontend

- **React**: UI framework
- **React Flow**: Node-based interface for pipeline creation
- **Zustand**: State management
- **Handlebars**: Template engine for prompt creation

### Backend / Execution Engine

- **JavaScript Modules**: For pipeline execution
- **Fetch API**: For communicating with LLM providers
- **JSON Schema**: For pipeline definition and validation

### LLM Integration

- **Ollama**: Local LLM execution
- **API Abstraction**: Common interface for different LLM providers

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Ollama (for local LLM execution)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/41rumble/llm-pipeline-builder.git
   cd llm-pipeline-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Setting Up Ollama

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model:
   ```bash
   ollama pull phi
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```

## Usage Guide

### Creating a Pipeline

1. **Add Nodes**: Drag node types from the palette on the left to the canvas
2. **Connect Nodes**: Click and drag from a node's output handle to another node's input handle
3. **Configure Nodes**: Click on a node to open its configuration panel
4. **Execute Pipeline**: Click the "Execute" button to run the pipeline
5. **View Results**: See the execution results in the output panel

### Example Pipeline: Question Generator

1. Add an Input node and set its value to a topic
2. Add a Prompt node and connect it to the Input node
3. Configure the Prompt node with a template like: "Generate 5 questions about {{query}}"
4. Enable "Fan Out" in the Prompt node settings
5. Add an LLM node and connect it to the Prompt node
6. Add a Summarizer node and connect it to the LLM node
7. Add an Output node and connect it to the Summarizer node
8. Execute the pipeline to generate and answer questions about the topic

## Development Roadmap

### Phase 1: Core Functionality (Completed)
- Basic node editor with React Flow
- Core node types (Input, Prompt, LLM, Output)
- Basic execution engine
- Ollama integration

### Phase 2: Enhanced Execution (In Progress)
- Fan-out and aggregation capabilities
- Improved error handling
- Better visualization of execution flow
- More node types and configurations

### Phase 3: Advanced Features (Planned)
- Pipeline management (save/load)
- Additional LLM providers
- Conditional routing
- Execution history

### Phase 4: Collaboration and Deployment (Future)
- User accounts and sharing
- Hosted execution engine
- API for programmatic access
- Mobile support

## Current Status

The application is currently in active development with the following recent improvements:

- **UI Enhancements**:
  - Added a minimap for navigating large pipelines
  - Implemented a navigation HUD that appears when nodes are outside the visible area
  - Improved node selection and configuration panel
  - Enhanced visual feedback during pipeline execution

- **LLM Integration**:
  - Added support for connecting to Ollama at a specific server address
  - Implemented model selection from available Ollama models
  - Added error handling for LLM connection issues

- **Pipeline Execution**:
  - Improved fan-out functionality with better response parsing
  - Enhanced error handling during execution
  - Added visual indicators for the currently executing node

- **Bug Fixes**:
  - Fixed issues with node type preservation during selection
  - Resolved configuration panel visibility problems
  - Fixed data persistence in node configurations

## Next Steps

The immediate focus is on:

1. **Stability Improvements**:
   - Further bug fixes and edge case handling
   - More comprehensive error reporting

2. **User Experience Enhancements**:
   - Improved node configuration interface
   - Better visualization of data flow during execution

3. **Feature Expansion**:
   - Save/load functionality for pipelines
   - Additional node types for more complex workflows
   - Support for more LLM providers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Flow](https://reactflow.dev/) for the node-based interface
- [Ollama](https://ollama.ai/) for local LLM execution
- [Handlebars](https://handlebarsjs.com/) for templating
