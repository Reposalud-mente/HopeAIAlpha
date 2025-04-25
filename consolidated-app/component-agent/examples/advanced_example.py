"""
Advanced Component Agent Example

This script demonstrates the advanced features of the component agent,
including streaming, async operations, and improved error handling.
"""

import asyncio
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


async def main():
    """Run the advanced example."""
    try:
        # Initialize the component agent
        agent = ComponentAgent()

        # Define a simple button component specification
        button_spec = {
            "name": "PrimaryButton",
            "description": "A primary button component with hover and focus states",
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
                    "name": "variant",
                    "type": "\"primary\" | \"secondary\" | \"tertiary\"",
                    "required": False,
                    "defaultValue": "\"primary\"",
                    "description": "The variant of the button"
                }
            ],
            "state": [
                {
                    "name": "isHovered",
                    "type": "boolean",
                    "initialValue": "false",
                    "description": "Whether the button is currently being hovered"
                }
            ],
            "functionality": "The button should handle click events and show different styles based on the variant prop. It should also have hover and focus states.",
            "styling": "Use Tailwind CSS for styling. The primary variant should be blue, the secondary variant should be gray, and the tertiary variant should be transparent with a border.",
            "dependencies": [
                "react",
                "tailwindcss",
                "@/components/ui/button"
            ]
        }

        # Generate the component with streaming
        print("\n=== Generating component with streaming ===")
        print("Generating PrimaryButton component...")
        
        # Create output directory if it doesn't exist
        output_dir = Path(__file__).parent / "output"
        output_dir.mkdir(exist_ok=True)
        
        # Open a file to write the streamed content
        with open(output_dir / "primary-button-streamed.tsx", "w", encoding="utf-8") as f:
            # Stream the component generation
            for chunk in agent.generate_component_stream(button_spec):
                print(chunk, end="")
                f.write(chunk)
        
        print("\n\nComponent generation with streaming completed.")
        
        # Generate the component asynchronously
        print("\n=== Generating component asynchronously ===")
        print("Generating PrimaryButton component...")
        
        # Generate the component asynchronously
        result = await agent.generate_component_async(button_spec)
        
        # Save the component to a file
        with open(output_dir / "primary-button-async.tsx", "w", encoding="utf-8") as f:
            f.write(result.get("code", ""))
        
        print("Component generation asynchronously completed.")
        
        # Define a simple component to analyze
        simple_component = """
import React, { useState } from 'react';

interface TodoItemProps {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ id, text, completed, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleToggle = () => {
    onToggle(id);
  };
  
  return (
    <div 
      className={`p-4 border rounded mb-2 ${completed ? 'bg-gray-100' : 'bg-white'} ${isHovered ? 'shadow' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        <input 
          type="checkbox" 
          checked={completed} 
          onChange={handleToggle} 
          className="mr-2"
        />
        <span className={completed ? 'line-through text-gray-500' : ''}>{text}</span>
      </div>
    </div>
  );
};

export default TodoItem;
        """
        
        # Analyze the component
        print("\n=== Analyzing component ===")
        print("Analyzing TodoItem component...")
        
        # Analyze the component
        analysis = await agent.analyze_component_async(simple_component, {
            "accessibility": True,
            "performance": True,
            "bestPractices": True
        })
        
        # Save the analysis to a file
        with open(output_dir / "todo-item-analysis.json", "w", encoding="utf-8") as f:
            import json
            json.dump(analysis, f, indent=2)
        
        print("Component analysis completed.")
        
        # Define modifications for the component
        modifications = {
            "description": "Improve the TodoItem component by adding a due date field, improving accessibility, and adding a hover effect.",
            "modifications": [
                {
                    "type": "update",
                    "target": "props",
                    "value": "Add a dueDate prop of type string that is optional"
                },
                {
                    "type": "update",
                    "target": "checkbox",
                    "value": "Replace the plain HTML checkbox with a shadcn/ui Checkbox component for better accessibility"
                },
                {
                    "type": "add",
                    "target": "styling",
                    "value": "Add a subtle hover effect to the card using Tailwind CSS"
                },
                {
                    "type": "add",
                    "target": "display",
                    "value": "Display the due date below the title if it exists"
                }
            ]
        }
        
        # Modify the component
        print("\n=== Modifying component ===")
        print("Modifying TodoItem component...")
        
        # Modify the component
        modified_component = await agent.modify_component_async(simple_component, modifications)
        
        # Save the modified component to a file
        with open(output_dir / "todo-item-modified.tsx", "w", encoding="utf-8") as f:
            f.write(modified_component.get("code", ""))
        
        print("Component modification completed.")
        
        print("\n=== All operations completed successfully ===")
        print(f"Output files are in: {output_dir}")

    except Exception as e:
        print(f"Error in advanced example: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
