#!/usr/bin/env python
"""
Component Agent CLI

This script provides a command-line interface for the component agent.
"""

import argparse
import json
import os
import sys
import traceback
from pathlib import Path

from component_agent import ComponentAgent


def setup_parser():
    """Set up the argument parser."""
    parser = argparse.ArgumentParser(description="Component Agent CLI - A tool for analyzing, generating, and modifying React components using Google's GenAI SDK")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Create a parent parser with common arguments
    parent_parser = argparse.ArgumentParser(add_help=False)
    parent_parser.add_argument("--system-prompt", help="Path to a custom system prompt file")
    parent_parser.add_argument("--model", default="gemini-2.5-pro-exp-03-25", help="Model to use for generation (default: gemini-2.5-pro-exp-03-25)")
    parent_parser.add_argument("--temperature", type=float, default=None, help="Temperature for generation (0.0 to 1.0)")
    parent_parser.add_argument("--max-tokens", type=int, default=None, help="Maximum number of tokens to generate")
    parent_parser.add_argument("--top-p", type=float, default=None, help="Top-p sampling parameter (0.0 to 1.0)")
    parent_parser.add_argument("--top-k", type=int, default=None, help="Top-k sampling parameter")
    parent_parser.add_argument("--safety-level", choices=["BLOCK_NONE", "BLOCK_ONLY_HIGH", "BLOCK_MEDIUM_AND_ABOVE", "BLOCK_LOW_AND_ABOVE"], default=None,
                              help="Safety level for content filtering")
    parent_parser.add_argument("--async", action="store_true", dest="use_async", help="Use async operations")

    # Analyze command
    analyze_parser = subparsers.add_parser("analyze", help="Analyze a component", parents=[parent_parser])
    analyze_parser.add_argument("component_path", help="Path to the component file or component code")
    analyze_parser.add_argument("--accessibility", action="store_true", help="Analyze for accessibility issues")
    analyze_parser.add_argument("--performance", action="store_true", help="Analyze for performance issues")
    analyze_parser.add_argument("--best-practices", action="store_true", help="Analyze for best practices")
    analyze_parser.add_argument("--output", "-o", help="Path to save the analysis results")

    # Generate command
    generate_parser = subparsers.add_parser("generate", help="Generate a component", parents=[parent_parser])
    generate_parser.add_argument("spec_path", help="Path to the component specification file")
    generate_parser.add_argument("--output", "-o", help="Path to save the generated component")
    generate_parser.add_argument("--style", choices=["functional", "class"], default="functional", help="Component style")
    generate_parser.add_argument("--typescript", action="store_true", help="Use TypeScript")
    generate_parser.add_argument("--jsdoc", action="store_true", help="Include JSDoc comments")
    generate_parser.add_argument("--shadcn", action="store_true", help="Use shadcn/ui components")
    generate_parser.add_argument("--tailwind", action="store_true", help="Use Tailwind CSS")
    generate_parser.add_argument("--stream", action="store_true", help="Stream the generation output")

    # Modify command
    modify_parser = subparsers.add_parser("modify", help="Modify a component", parents=[parent_parser])
    modify_parser.add_argument("component_path", help="Path to the component file")
    modify_parser.add_argument("modifications_path", help="Path to the modifications file")
    modify_parser.add_argument("--output", "-o", help="Path to save the modified component")
    modify_parser.add_argument("--quick-edit", action="store_true", help="Use QuickEdit for small modifications")

    # List models command
    list_models_parser = subparsers.add_parser("list-models", help="List available models", parents=[parent_parser])
    list_models_parser.add_argument("--page-size", type=int, default=10, help="Number of models to list per page")
    list_models_parser.add_argument("--query-base", action="store_true", help="Query base models (default: false, lists tuned models)")

    # Chat command
    chat_parser = subparsers.add_parser("chat", help="Start a chat session with the model", parents=[parent_parser])
    chat_parser.add_argument("--history-file", help="Path to save/load chat history")
    chat_parser.add_argument("--stream", action="store_true", help="Stream the chat responses")

    return parser


async def analyze_component_async(agent, component_code, options):
    """Analyze a component asynchronously."""
    print("\nAnalyzing component asynchronously...")
    analysis = await agent.analyze_component_async(component_code, options)
    print("Analysis completed.")
    return analysis


def analyze_component(args):
    """Analyze a component."""
    try:
        # Load custom system prompt if provided
        system_prompt = None
        if args.system_prompt and os.path.exists(args.system_prompt):
            with open(args.system_prompt, "r", encoding="utf-8") as f:
                system_prompt = f.read()
            print(f"Using custom prompt from: {args.system_prompt}")

        # Initialize the component agent with model parameters
        agent = ComponentAgent(
            system_prompt=system_prompt,
            model_name=args.model
        )

        # Read the component code if a file path is provided
        if os.path.exists(args.component_path):
            with open(args.component_path, "r", encoding="utf-8") as f:
                component_code = f.read()
            print(f"Reading component from: {args.component_path}")
        else:
            component_code = args.component_path
            print("Using component code provided directly.")

        # Set up analysis options
        options = {
            "accessibility": args.accessibility,
            "performance": args.performance,
            "bestPractices": args.best_practices
        }

        # Add generation config options if provided
        if any([args.temperature, args.max_tokens, args.top_p, args.top_k, args.safety_level]):
            options["config"] = {}
            if args.temperature is not None:
                options["config"]["temperature"] = args.temperature
            if args.max_tokens is not None:
                options["config"]["max_output_tokens"] = args.max_tokens
            if args.top_p is not None:
                options["config"]["top_p"] = args.top_p
            if args.top_k is not None:
                options["config"]["top_k"] = args.top_k
            if args.safety_level is not None:
                options["config"]["safety_settings"] = [
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": args.safety_level
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": args.safety_level
                    }
                ]

        # Analyze the component (async or sync)
        if args.use_async:
            import asyncio
            analysis = asyncio.run(analyze_component_async(agent, component_code, options))
        else:
            print("\nAnalyzing component...")
            analysis = agent.analyze_component(component_code, options)
            print("Analysis completed.")

        # Save the analysis results if an output path is provided
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(analysis, f, indent=2)
            print(f"\nAnalysis results saved to: {args.output}")
        else:
            print("\nAnalysis results:")
            print(json.dumps(analysis, indent=2))

        print("\nPress Enter to continue...")
        input()
    except Exception as e:
        print(f"\nError analyzing component: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        print("\nPress Enter to continue...")
        input()
        sys.exit(1)


async def generate_component_async(agent, spec, options):
    """Generate a component asynchronously."""
    print("\nGenerating component asynchronously...")
    component = await agent.generate_component_async(spec, options)
    print("Generation completed.")
    return component


def generate_component_stream(agent, spec, options, output_file=None):
    """Generate a component with streaming output."""
    print("\nGenerating component with streaming...")

    # Create a buffer to store the generated code
    code_buffer = []

    try:
        # Stream the component generation
        for chunk in agent.generate_component_stream(spec, options):
            print(chunk, end="", flush=True)
            code_buffer.append(chunk)

            # Write to file in real-time if output path is provided
            if output_file:
                with open(output_file, "a", encoding="utf-8") as f:
                    f.write(chunk)

        print("\n\nGeneration completed.")

        # Return the complete code as a component dict
        return {"code": "".join(code_buffer)}
    except Exception as e:
        print(f"\nError during streaming generation: {str(e)}")
        raise


def generate_component(args):
    """Generate a component."""
    try:
        # Load custom system prompt if provided
        system_prompt = None
        if args.system_prompt and os.path.exists(args.system_prompt):
            with open(args.system_prompt, "r", encoding="utf-8") as f:
                system_prompt = f.read()
            print(f"Using custom prompt from: {args.system_prompt}")

        # Initialize the component agent with model parameters
        agent = ComponentAgent(
            system_prompt=system_prompt,
            model_name=args.model
        )

        # Read the component specification
        print(f"Reading specification from: {args.spec_path}")
        with open(args.spec_path, "r", encoding="utf-8") as f:
            spec = json.load(f)

        # Set up generation options
        options = {
            "style": args.style,
            "typescript": args.typescript,
            "jsdoc": args.jsdoc,
            "shadcn": args.shadcn,
            "tailwind": args.tailwind
        }

        # Add generation config options if provided
        if any([args.temperature, args.max_tokens, args.top_p, args.top_k, args.safety_level]):
            options["config"] = {}
            if args.temperature is not None:
                options["config"]["temperature"] = args.temperature
            if args.max_tokens is not None:
                options["config"]["max_output_tokens"] = args.max_tokens
            if args.top_p is not None:
                options["config"]["top_p"] = args.top_p
            if args.top_k is not None:
                options["config"]["top_k"] = args.top_k
            if args.safety_level is not None:
                options["config"]["safety_settings"] = [
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": args.safety_level
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": args.safety_level
                    }
                ]

        # Clear output file if streaming to file
        if args.stream and args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write("")

        # Generate the component (streaming, async, or sync)
        if args.stream:
            component = generate_component_stream(agent, spec, options, args.output)
        elif args.use_async:
            import asyncio
            component = asyncio.run(generate_component_async(agent, spec, options))
        else:
            print("\nGenerating component...")
            component = agent.generate_component(spec, options)
            print("Generation completed.")

        # Save the generated component if an output path is provided and not already saved by streaming
        if args.output and not args.stream:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(component["code"])
            print(f"\nGenerated component saved to: {args.output}")
        elif not args.stream:
            print("\nGenerated component code:")
            print(component["code"])

        print("\nPress Enter to continue...")
        input()
    except Exception as e:
        print(f"\nError generating component: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        print("\nPress Enter to continue...")
        input()
        sys.exit(1)


async def modify_component_async(agent, component_code, modifications, options):
    """Modify a component asynchronously."""
    print("\nModifying component asynchronously...")
    modified_component = await agent.modify_component_async(component_code, modifications, options)
    print("Modification completed.")
    return modified_component


def modify_component(args):
    """Modify a component."""
    try:
        # Load custom system prompt if provided
        system_prompt = None
        if args.system_prompt and os.path.exists(args.system_prompt):
            with open(args.system_prompt, "r", encoding="utf-8") as f:
                system_prompt = f.read()
            print(f"Using custom prompt from: {args.system_prompt}")

        # Initialize the component agent with model parameters
        agent = ComponentAgent(
            system_prompt=system_prompt,
            model_name=args.model
        )

        # Read the component code
        print(f"Reading component from: {args.component_path}")
        with open(args.component_path, "r", encoding="utf-8") as f:
            component_code = f.read()

        # Read the modifications
        print(f"Reading modifications from: {args.modifications_path}")
        with open(args.modifications_path, "r", encoding="utf-8") as f:
            modifications = json.load(f)

        # Set up modification options
        options = {
            "useQuickEdit": args.quick_edit
        }

        # Add generation config options if provided
        if any([args.temperature, args.max_tokens, args.top_p, args.top_k, args.safety_level]):
            options["config"] = {}
            if args.temperature is not None:
                options["config"]["temperature"] = args.temperature
            if args.max_tokens is not None:
                options["config"]["max_output_tokens"] = args.max_tokens
            if args.top_p is not None:
                options["config"]["top_p"] = args.top_p
            if args.top_k is not None:
                options["config"]["top_k"] = args.top_k
            if args.safety_level is not None:
                options["config"]["safety_settings"] = [
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": args.safety_level
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": args.safety_level
                    }
                ]

        # Modify the component (async or sync)
        if args.use_async:
            import asyncio
            modified_component = asyncio.run(modify_component_async(agent, component_code, modifications, options))
        else:
            print("\nModifying component...")
            modified_component = agent.modify_component(component_code, modifications, options)
            print("Modification completed.")

        # Save the modified component if an output path is provided
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(modified_component["code"])
            print(f"\nModified component saved to: {args.output}")
        else:
            print("\nModified component code:")
            print(modified_component["code"])

        print("\nPress Enter to continue...")
        input()
    except Exception as e:
        print(f"\nError modifying component: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        print("\nPress Enter to continue...")
        input()
        sys.exit(1)


def list_models(args):
    """List available models."""
    try:
        # Initialize the component agent with model parameters
        agent = ComponentAgent(
            model_name=args.model
        )

        print("\nListing available models...")

        # List models
        if args.use_async:
            import asyncio

            async def list_models_async():
                pager = await agent.client.aio.models.list(config={'page_size': args.page_size})
                models = [model for model in pager]
                return models

            models = asyncio.run(list_models_async())
        else:
            pager = agent.client.models.list(config={'page_size': args.page_size})
            models = [model for model in pager]

        print(f"\nFound {len(models)} models:")
        for i, model in enumerate(models, 1):
            print(f"{i}. {model.name}")
            if hasattr(model, 'description') and model.description:
                print(f"   Description: {model.description}")
            if hasattr(model, 'input_token_limit') and model.input_token_limit:
                print(f"   Input token limit: {model.input_token_limit}")
            if hasattr(model, 'output_token_limit') and model.output_token_limit:
                print(f"   Output token limit: {model.output_token_limit}")
            print()

        print("\nPress Enter to continue...")
        input()
    except Exception as e:
        print(f"\nError listing models: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        print("\nPress Enter to continue...")
        input()
        sys.exit(1)


def chat_with_model(args):
    """Start a chat session with the model."""
    try:
        # Initialize the component agent with model parameters
        agent = ComponentAgent(
            system_prompt=args.system_prompt,
            model_name=args.model
        )

        # Create a chat session
        print(f"\nStarting chat session with model {args.model}...")
        print("Type 'exit' or 'quit' to end the session.")

        # Set up chat options
        options = {}
        if any([args.temperature, args.max_tokens, args.top_p, args.top_k, args.safety_level]):
            options["config"] = {}
            if args.temperature is not None:
                options["config"]["temperature"] = args.temperature
            if args.max_tokens is not None:
                options["config"]["max_output_tokens"] = args.max_tokens
            if args.top_p is not None:
                options["config"]["top_p"] = args.top_p
            if args.top_k is not None:
                options["config"]["top_k"] = args.top_k
            if args.safety_level is not None:
                options["config"]["safety_settings"] = [
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": args.safety_level
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": args.safety_level
                    }
                ]

        # Create a chat session
        chat = agent.client.chats.create(model=args.model)

        # Chat loop
        while True:
            # Get user input
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit"]:
                break

            # Send message to the model
            if args.stream:
                print("\nModel: ", end="")
                for chunk in chat.send_message_stream(user_input):
                    print(chunk.text, end="", flush=True)
                print()
            else:
                response = chat.send_message(user_input)
                print(f"\nModel: {response.text}")

        print("\nChat session ended.")
    except Exception as e:
        print(f"\nError in chat session: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)


def main():
    """Main entry point."""
    parser = setup_parser()
    args = parser.parse_args()

    if args.command == "analyze":
        analyze_component(args)
    elif args.command == "generate":
        generate_component(args)
    elif args.command == "modify":
        modify_component(args)
    elif args.command == "list-models":
        list_models(args)
    elif args.command == "chat":
        chat_with_model(args)
    else:
        parser.print_help()
        print("\nPress Enter to continue...")
        input()


if __name__ == "__main__":
    main()
