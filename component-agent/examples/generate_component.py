"""
Example: Generate Component

This example demonstrates how to use the component agent to generate a React component.
"""

import os
import sys
import traceback
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from component_agent import ComponentAgent

def main():
    try:
        # Initialize the component agent
        agent = ComponentAgent()

        # Define the component specification
        component_spec = {
            "name": "ProductCard",
            "description": "A card component for displaying product information with image, title, price, and add to cart button.",
            "props": [
                {
                    "name": "product",
                    "type": "Product",
                    "required": True,
                    "description": "The product to display"
                },
                {
                    "name": "onAddToCart",
                    "type": "(product: Product) => void",
                    "required": False,
                    "description": "Callback function when the add to cart button is clicked"
                },
                {
                    "name": "showRating",
                    "type": "boolean",
                    "required": False,
                    "defaultValue": "true",
                    "description": "Whether to show the product rating"
                }
            ],
            "state": [
                {
                    "name": "isHovered",
                    "type": "boolean",
                    "initialValue": "false",
                    "description": "Whether the card is being hovered"
                }
            ],
            "functionality": "The component should display the product image, title, price, and an add to cart button. When the add to cart button is clicked, the onAddToCart callback should be called with the product. The component should also show the product rating if showRating is true.",
            "styling": "The component should use Tailwind CSS for styling and shadcn/ui components for the button. The card should have a hover effect that slightly elevates it and changes its shadow.",
            "dependencies": [
                "@/components/ui/button",
                "@/components/ui/card",
                "lucide-react"
            ],
            "examples": [
                "<ProductCard product={{ id: '1', title: 'Product 1', price: 19.99, image: '/product1.jpg', rating: 4.5 }} onAddToCart={(product) => console.log('Added to cart:', product)} />"
            ]
        }

        # Generate the component
        generated_component = agent.generate_component(
            component_spec,
            {
                "style": "functional",
                "typescript": True,
                "jsdoc": True,
                "shadcn": True,
                "tailwind": True
            }
        )

        # Print the generated component
        print("Generated Component:")
        print("===================")
        print(f"Component Name: {generated_component.get('name', 'Unknown')}")
        print(f"File Path: {generated_component.get('filePath', 'Unknown')}")
        print("\nComponent Code:")
        print(generated_component.get("code", ""))

        # Save the generated component to a file
        output_dir = Path(__file__).parent / "output"
        output_dir.mkdir(exist_ok=True)

        file_path = output_dir / generated_component.get("filePath", "product-card.tsx")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(generated_component.get("code", ""))

        print(f"\nComponent saved to: {file_path}")
    except Exception as e:
        print(f"Error generating component: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
