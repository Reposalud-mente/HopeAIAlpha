# Component Agent Examples

This directory contains examples of how to use the component agent.

## Prerequisites

Before running the examples, make sure you have:

1. Installed the required dependencies:
```bash
pip install -r ../requirements.txt
```

2. Set up your Google API key:
```bash
export GOOGLE_API_KEY='your-api-key'
```

## Examples

### Analyze Component

This example demonstrates how to use the component agent to analyze a React component.

```bash
python analyze_component.py
```

### Generate Component

This example demonstrates how to use the component agent to generate a React component based on a specification.

```bash
python generate_component.py
```

### Modify Component

This example demonstrates how to use the component agent to modify an existing React component.

```bash
python modify_component.py
```

## Output

The examples will save their output to the `output` directory, which will be created if it doesn't exist.
