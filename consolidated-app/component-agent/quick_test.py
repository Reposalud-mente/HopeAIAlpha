"""
Quick Test of Component Agent

This script performs a quick test of the component agent by generating a simple button component.
"""

import os
import sys
import traceback
from pathlib import Path

import dotenv
from component_agent import ComponentAgent

# Load environment variables from .env file
dotenv.load_dotenv()

def main():
    """Test the component agent with a simple example."""
    try:
        # Initialize the component agent
        agent = ComponentAgent()

        # Define a simple component specification
        button_spec = {
            "name": "PrimaryButton",
            "description": "A primary button component with customizable text and onClick handler.",
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
                    "required": False,
                    "description": "Function to call when the button is clicked"
                },
                {
                    "name": "disabled",
                    "type": "boolean",
                    "required": False,
                    "defaultValue": "false",
                    "description": "Whether the button is disabled"
                }
            ],
            "styling": "The button should use Tailwind CSS for styling and should have a primary color background with white text. It should have rounded corners and a subtle hover effect."
        }

        # Generate the component
        print("Generating PrimaryButton component...")
        result = agent.generate_component(button_spec)

        # Print the result
        print("\nGenerated Component:")
        print("===================")
        print(result.get("code", ""))

        # Save the component to a file
        output_dir = Path("examples/output")
        output_dir.mkdir(exist_ok=True, parents=True)

        file_path = output_dir / "primary-button.tsx"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(result.get("code", ""))

        print(f"\nComponent saved to: {file_path}")

    except Exception as e:
        print(f"Error testing component agent: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
