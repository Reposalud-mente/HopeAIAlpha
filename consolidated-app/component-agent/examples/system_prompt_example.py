"""
System Prompt Example

This script demonstrates how to use a custom system prompt with the component agent.
"""

import os
import sys
import traceback
from pathlib import Path

import dotenv
from component_agent import ComponentAgent

# Add the parent directory to the path to import the component_agent module
sys.path.append(str(Path(__file__).parent.parent))

# Load environment variables from .env file
dotenv.load_dotenv()


def main():
    """Run the system prompt example."""
    try:
        # Define a custom system prompt
        custom_system_prompt = """
        # Custom System Prompt
        
        You are a specialized React component developer focused on creating accessible and performant UI components.
        Your primary goal is to ensure all components follow WCAG 2.1 AA standards and perform efficiently.
        
        When analyzing components, focus on:
        - Accessibility issues (proper ARIA attributes, keyboard navigation, color contrast)
        - Performance optimizations (memoization, lazy loading, efficient rendering)
        - Modern React patterns (hooks, context, composition over inheritance)
        
        When generating components, prioritize:
        - Semantic HTML structure
        - Comprehensive accessibility features
        - Performance best practices
        - Clean, maintainable code structure
        """
        
        # Initialize the component agent with the custom system prompt
        agent = ComponentAgent(system_prompt=custom_system_prompt)
        
        # Define a simple button component specification
        button_spec = {
            "name": "AccessibleButton",
            "description": "A fully accessible button component with proper ARIA attributes and keyboard support",
            "props": [
                {
                    "name": "children",
                    "type": "React.ReactNode",
                    "required": True,
                    "description": "The content of the button"
                },
                {
                    "name": "onClick",
                    "type": "() => void",
                    "required": True,
                    "description": "Function to call when the button is clicked"
                },
                {
                    "name": "disabled",
                    "type": "boolean",
                    "required": False,
                    "defaultValue": "false",
                    "description": "Whether the button is disabled"
                },
                {
                    "name": "ariaLabel",
                    "type": "string",
                    "required": False,
                    "description": "Accessible label for the button"
                }
            ],
            "functionality": "The button should be fully accessible, supporting keyboard navigation, screen readers, and proper focus states.",
            "styling": "Use Tailwind CSS for styling with appropriate focus and hover states that meet WCAG 2.1 AA contrast requirements."
        }
        
        # Generate the component
        print("\n=== Generating accessible component with custom system prompt ===")
        print("Generating AccessibleButton component...")
        
        # Create output directory if it doesn't exist
        output_dir = Path(__file__).parent / "output"
        output_dir.mkdir(exist_ok=True)
        
        # Generate the component
        result = agent.generate_component(button_spec)
        
        # Save the component to a file
        with open(output_dir / "accessible-button.tsx", "w", encoding="utf-8") as f:
            f.write(result.get("code", ""))
        
        print(f"\nComponent generated and saved to: {output_dir / 'accessible-button.tsx'}")
        
        # Define a simple component to analyze
        simple_component = """
import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded ${disabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
    >
      {text}
    </button>
  );
};

export default Button;
        """
        
        # Analyze the component
        print("\n=== Analyzing component with custom system prompt ===")
        print("Analyzing Button component...")
        
        # Analyze the component
        analysis = agent.analyze_component(simple_component, {
            "accessibility": True,
            "performance": True
        })
        
        # Save the analysis to a file
        with open(output_dir / "button-analysis.json", "w", encoding="utf-8") as f:
            import json
            json.dump(analysis, f, indent=2)
        
        print(f"\nComponent analysis saved to: {output_dir / 'button-analysis.json'}")
        
        print("\n=== Example completed successfully ===")

    except Exception as e:
        print(f"Error in system prompt example: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
