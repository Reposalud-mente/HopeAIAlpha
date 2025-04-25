# Component Agent

A specialized AI agent for creating and improving React components based on user requests, powered by Google's Generative AI Python SDK.

## Overview

This agent leverages Google's Gen AI SDK to analyze, generate, and modify React components following best practices for React, Next.js, and accessibility. It uses advanced features of the SDK including configuration options, safety settings, streaming, and async operations.

## Interactive Chat Interface

The Component Agent now includes an interactive chat interface that allows you to interact with the agent using natural language. The chat interface can understand your requests and use the appropriate tools to analyze, generate, or modify components.

```bash
python chat_agent.py
```

## Features

- Component analysis to identify areas for improvement
- Component generation based on user requirements
- Component modification to enhance existing components
- Integration with Google's Gen AI SDK for code generation
- Best practices enforcement for React, Next.js, and accessibility
- Streaming support for real-time component generation
- Async operations for improved performance
- Comprehensive error handling and safety settings
- System instructions for improved generation quality
- Customizable system prompts for specialized component development

## Getting Started

1. Install dependencies:
```bash
# En Windows, puedes usar el script de instalación
setup.bat

# O instalar manualmente
pip install -r requirements.txt
```

2. Set up your Google API key:
```bash
# En Linux/Mac
export GOOGLE_API_KEY='your-api-key'

# En Windows, crea un archivo .env con el contenido:
GOOGLE_API_KEY=your-api-key
```

3. Use the component agent:
```python
from component_agent import ComponentAgent

# Basic usage
agent = ComponentAgent()
result = agent.analyze_component('path/to/component.tsx')

# Streaming usage
for chunk in agent.generate_component_stream(spec):
    print(chunk, end="")

# Async usage
import asyncio

async def main():
    result = await agent.analyze_component_async('path/to/component.tsx')
    print(result)

asyncio.run(main())

# Custom system prompt usage
custom_prompt = """You are a specialized React component developer focused on accessibility..."""
agent = ComponentAgent(system_prompt=custom_prompt)
result = agent.generate_component(spec)
```

4. Or use the CLI:
```bash
# En Windows
component-agent.bat analyze path/to/component.tsx

# En Linux/Mac
python cli.py analyze path/to/component.tsx
```

## Architecture

The component agent is built with a modular architecture:

- Core agent infrastructure for handling requests
- Operation modules for analysis, generation, and modification
- AI integration for code generation
- Utility functions for parsing and formatting components
- User interfaces for different interaction methods

## Usage Examples

See the `examples` directory for usage examples.
