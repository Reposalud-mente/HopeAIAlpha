# Component Agent CLI

The Component Agent CLI provides a command-line interface for analyzing, generating, and modifying React components using Google's GenAI SDK.

## Interactive Chat Interface

In addition to the command-line interface, the Component Agent now includes an interactive chat interface that allows you to interact with the agent using natural language. The chat interface can understand your requests and use the appropriate tools to analyze, generate, or modify components.

```bash
python chat_agent.py [options]
```

Options:
- `--model`: Model to use for the chat (default: gemini-2.5-pro-exp-03-25)
- `--system-prompt`: Path to a custom system prompt file

Example:
```bash
python chat_agent.py --model gemini-2.5-pro-exp-03-25
```

Once the chat interface is running, you can interact with it using natural language. For example:

```
You: Can you analyze the Button component in examples/Button.tsx?
Agent: I'll analyze the Button component for you. Let me do that now...
```

The chat interface will understand your request and use the appropriate tools to complete the task.

## Installation

Make sure you have installed the component-agent package:

```bash
pip install -e .
```

## Usage

```bash
python cli.py [command] [options]
```

## Commands

### Analyze Component

Analyze a React component to identify its structure, props, state, hooks, and potential issues.

```bash
python cli.py analyze [component_path] [options]
```

Options:
- `--accessibility`: Analyze for accessibility issues
- `--performance`: Analyze for performance issues
- `--best-practices`: Analyze for best practices
- `--output`, `-o`: Path to save the analysis results
- `--model`: Model to use for analysis (default: gemini-2.5-pro-exp-03-25)
- `--temperature`: Temperature for generation (0.0 to 1.0)
- `--max-tokens`: Maximum number of tokens to generate
- `--top-p`: Top-p sampling parameter (0.0 to 1.0)
- `--top-k`: Top-k sampling parameter
- `--safety-level`: Safety level for content filtering (BLOCK_NONE, BLOCK_ONLY_HIGH, BLOCK_MEDIUM_AND_ABOVE, BLOCK_LOW_AND_ABOVE)
- `--async`: Use async operations
- `--system-prompt`: Path to a custom system prompt file

Example:
```bash
python cli.py analyze components/Button.tsx --accessibility --performance --output analysis.json
```

### Generate Component

Generate a new React component based on a specification.

```bash
python cli.py generate [spec_path] [options]
```

Options:
- `--output`, `-o`: Path to save the generated component
- `--style`: Component style (functional or class, default: functional)
- `--typescript`: Use TypeScript
- `--jsdoc`: Include JSDoc comments
- `--shadcn`: Use shadcn/ui components
- `--tailwind`: Use Tailwind CSS
- `--stream`: Stream the generation output
- `--model`: Model to use for generation (default: gemini-2.5-pro-exp-03-25)
- `--temperature`: Temperature for generation (0.0 to 1.0)
- `--max-tokens`: Maximum number of tokens to generate
- `--top-p`: Top-p sampling parameter (0.0 to 1.0)
- `--top-k`: Top-k sampling parameter
- `--safety-level`: Safety level for content filtering
- `--async`: Use async operations
- `--system-prompt`: Path to a custom system prompt file

Example:
```bash
python cli.py generate specs/button.json --typescript --tailwind --output components/Button.tsx --stream
```

### Modify Component

Modify an existing React component based on a specification.

```bash
python cli.py modify [component_path] [modifications_path] [options]
```

Options:
- `--output`, `-o`: Path to save the modified component
- `--quick-edit`: Use QuickEdit for small modifications
- `--model`: Model to use for modification (default: gemini-2.5-pro-exp-03-25)
- `--temperature`: Temperature for generation (0.0 to 1.0)
- `--max-tokens`: Maximum number of tokens to generate
- `--top-p`: Top-p sampling parameter (0.0 to 1.0)
- `--top-k`: Top-k sampling parameter
- `--safety-level`: Safety level for content filtering
- `--async`: Use async operations
- `--system-prompt`: Path to a custom system prompt file

Example:
```bash
python cli.py modify components/Button.tsx modifications/add-hover.json --output components/ButtonWithHover.tsx
```

### List Models

List available models that can be used for generation.

```bash
python cli.py list-models [options]
```

Options:
- `--page-size`: Number of models to list per page (default: 10)
- `--query-base`: Query base models (default: false, lists tuned models)
- `--async`: Use async operations

Example:
```bash
python cli.py list-models --page-size 20
```

### Chat

Start a chat session with the model.

```bash
python cli.py chat [options]
```

Options:
- `--history-file`: Path to save/load chat history
- `--stream`: Stream the chat responses
- `--model`: Model to use for chat (default: gemini-2.5-pro-exp-03-25)
- `--temperature`: Temperature for generation (0.0 to 1.0)
- `--max-tokens`: Maximum number of tokens to generate
- `--top-p`: Top-p sampling parameter (0.0 to 1.0)
- `--top-k`: Top-k sampling parameter
- `--safety-level`: Safety level for content filtering
- `--system-prompt`: Path to a custom system prompt file

Example:
```bash
python cli.py chat --stream --temperature 0.7
```

## Common Options

These options are available for all commands:

- `--model`: Model to use for generation (default: gemini-2.5-pro-exp-03-25)
- `--temperature`: Temperature for generation (0.0 to 1.0)
- `--max-tokens`: Maximum number of tokens to generate
- `--top-p`: Top-p sampling parameter (0.0 to 1.0)
- `--top-k`: Top-k sampling parameter
- `--safety-level`: Safety level for content filtering
- `--async`: Use async operations
- `--system-prompt`: Path to a custom system prompt file

## Examples

### Analyze a Component with Custom Settings

```bash
python cli.py analyze components/Button.tsx --accessibility --performance --best-practices --temperature 0.2 --max-tokens 2048 --safety-level BLOCK_ONLY_HIGH
```

### Generate a Component with Streaming

```bash
python cli.py generate specs/button.json --typescript --tailwind --stream --temperature 0.7
```

### Modify a Component Asynchronously

```bash
python cli.py modify components/Button.tsx modifications/add-hover.json --async --temperature 0.4
```

### List Available Models

```bash
python cli.py list-models
```

### Chat with the Model

```bash
python cli.py chat --stream --temperature 0.7
```

## Custom System Prompts

You can provide a custom system prompt file to guide the model's behavior:

```bash
python cli.py generate specs/button.json --system-prompt prompts/accessibility-focused.txt
```

The system prompt file should contain instructions for the model on how to approach the task.
