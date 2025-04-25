"""
Example: Modify Component

This example demonstrates how to use the component agent to modify a React component.
"""

import os
import sys
import traceback
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from component_agent import ComponentAgent

# Sample React component to modify
SAMPLE_COMPONENT = """
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TodoItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ id, title, completed, onToggle, onDelete }: TodoItemProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => onToggle(id)}
              className="mr-2"
            />
            <span className={completed ? 'line-through text-gray-500' : ''}>
              {title}
            </span>
          </div>
          <Button variant="destructive" onClick={() => onDelete(id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
"""

def main():
    try:
        # Initialize the component agent
        agent = ComponentAgent()

        # Define the modifications
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
        modified_component = agent.modify_component(
            SAMPLE_COMPONENT,
            modifications,
            {
                "useQuickEdit": True
            }
        )

        # Print the modified component
        print("Modified Component:")
        print("===================")
        print(f"Component Name: {modified_component.get('name', 'Unknown')}")
        print(f"File Path: {modified_component.get('filePath', 'Unknown')}")
        print("\nApplied Modifications:")
        for mod in modified_component.get("appliedModifications", []):
            print(f"- {mod.get('type', '')} {mod.get('target', '')}")

        print("\nModified Component Code:")
        print(modified_component.get("code", ""))

        # Save the modified component to a file
        output_dir = Path(__file__).parent / "output"
        output_dir.mkdir(exist_ok=True)

        file_path = output_dir / modified_component.get("filePath", "modified-todo-item.tsx")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(modified_component.get("code", ""))

        print(f"\nModified component saved to: {file_path}")
    except Exception as e:
        print(f"Error modifying component: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
