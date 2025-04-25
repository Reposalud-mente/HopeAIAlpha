#!/usr/bin/env python
"""
Component Agent Chat Interface

This script provides an interactive chat interface for the component agent.
It allows users to interact with the agent using natural language and
leverages the existing tools to analyze, generate, and modify components.
"""

import os
import sys
import json
import glob
import asyncio
import argparse
import traceback
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

import dotenv
from google import genai
from google.genai import types

from component_agent import ComponentAgent
from component_agent.utils.system_prompts import DEFAULT_SYSTEM_PROMPT

# Load environment variables from .env file
dotenv.load_dotenv()

# Define project paths
PROJECT_ROOT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
SRC_DIR = os.path.join(PROJECT_ROOT, 'src')


class AgentTool:
    """Base class for agent tools."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the tool with the given arguments."""
        raise NotImplementedError("Tool execution not implemented")


class AnalyzeComponentTool(AgentTool):
    """Tool for analyzing components."""

    def __init__(self, agent: ComponentAgent):
        super().__init__(
            name="analyze_component",
            description="Analyze a React component to identify its structure, props, state, hooks, and potential issues."
        )
        self.agent = agent

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the analyze component tool."""
        component_path = args.get("component_path")
        options = args.get("options", {})

        if not component_path:
            return {
                "error": "No component path provided.",
                "message": "Failed to analyze component: No component path provided."
            }

        # Normalize path (replace backslashes with forward slashes)
        if isinstance(component_path, str):
            component_path = component_path.replace("\\", "/")

        # Resolve the file path
        if isinstance(component_path, str) and os.path.exists(component_path):
            # Direct path exists
            try:
                with open(component_path, "r", encoding="utf-8") as f:
                    component_code = f.read()
                print(f"Reading component from: {component_path}")
            except Exception as e:
                return {
                    "error": f"Error reading file: {str(e)}",
                    "message": f"Failed to analyze component: {str(e)}"
                }
        elif isinstance(component_path, str) and os.path.exists(os.path.join(PROJECT_ROOT, component_path)):
            # Path relative to project root
            full_path = os.path.join(PROJECT_ROOT, component_path)
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    component_code = f.read()
                print(f"Reading component from: {full_path}")
            except Exception as e:
                return {
                    "error": f"Error reading file: {str(e)}",
                    "message": f"Failed to analyze component: {str(e)}"
                }
        else:
            # Assume it's direct code
            component_code = component_path
            print("Using component code provided directly.")

        # Analyze the component
        try:
            print("\nAnalyzing component...")
            analysis = self.agent.analyze_component(component_code, options)
            print("Analysis completed.")

            return {
                "result": analysis,
                "message": "Component analysis completed successfully."
            }
        except Exception as e:
            return {
                "error": f"Error analyzing component: {str(e)}",
                "message": f"Failed to analyze component: {str(e)}"
            }


class GenerateComponentTool(AgentTool):
    """Tool for generating components."""

    def __init__(self, agent: ComponentAgent):
        super().__init__(
            name="generate_component",
            description="Generate a new React component based on a specification."
        )
        self.agent = agent

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the generate component tool."""
        spec = args.get("spec")
        options = args.get("options", {})
        output_path = args.get("output_path")
        stream = args.get("stream", False)

        # Generate the component
        if stream:
            print("\nGenerating component with streaming...")
            code_buffer = []

            # Stream the component generation
            for chunk in self.agent.generate_component_stream(spec, options):
                print(chunk, end="", flush=True)
                code_buffer.append(chunk)

                # Write to file in real-time if output path is provided
                if output_path:
                    with open(output_path, "a", encoding="utf-8") as f:
                        f.write(chunk)

            print("\n\nGeneration completed.")
            component = {"code": "".join(code_buffer)}
        else:
            print("\nGenerating component...")
            component = self.agent.generate_component(spec, options)
            print("Generation completed.")

            # Save the component if an output path is provided
            if output_path:
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(component["code"])
                print(f"\nGenerated component saved to: {output_path}")

        return {
            "result": component,
            "message": "Component generation completed successfully."
        }


class ModifyComponentTool(AgentTool):
    """Tool for modifying components."""

    def __init__(self, agent: ComponentAgent):
        super().__init__(
            name="modify_component",
            description="Modify an existing React component based on a specification."
        )
        self.agent = agent

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the modify component tool."""
        try:
            component_path = args.get("component_path")
            if not component_path:
                return {
                    "error": "No component path provided.",
                    "message": "Failed to modify component: No component path provided."
                }

            # Normalize path
            if isinstance(component_path, str):
                component_path = component_path.replace("\\", "/")

            modifications = args.get("modifications")
            if not modifications:
                return {
                    "error": "No modifications provided.",
                    "message": "Failed to modify component: No modifications provided."
                }

            options = args.get("options", {})
            output_path = args.get("output_path")

            # Resolve the file path
            if isinstance(component_path, str) and os.path.exists(component_path):
                # Direct path exists
                try:
                    with open(component_path, "r", encoding="utf-8") as f:
                        component_code = f.read()
                    print(f"Reading component from: {component_path}")
                except Exception as e:
                    return {
                        "error": f"Error reading file: {str(e)}",
                        "message": f"Failed to modify component: {str(e)}"
                    }
            elif isinstance(component_path, str) and os.path.exists(os.path.join(PROJECT_ROOT, component_path)):
                # Path relative to project root
                full_path = os.path.join(PROJECT_ROOT, component_path)
                try:
                    with open(full_path, "r", encoding="utf-8") as f:
                        component_code = f.read()
                    print(f"Reading component from: {full_path}")
                    component_path = full_path
                except Exception as e:
                    return {
                        "error": f"Error reading file: {str(e)}",
                        "message": f"Failed to modify component: {str(e)}"
                    }
            else:
                # Try alternative paths
                alternative_paths = [
                    os.path.join(PROJECT_ROOT, "src", component_path),
                    os.path.join(PROJECT_ROOT, "src", "components", component_path),
                    os.path.join(PROJECT_ROOT, "src", "pages", component_path),
                    os.path.join(PROJECT_ROOT, "src", "components", "clinical", component_path),
                    os.path.join(PROJECT_ROOT, "src", "components", "clinical", "dynamic-wizard", component_path)
                ]

                for alt_path in alternative_paths:
                    if os.path.exists(alt_path):
                        try:
                            with open(alt_path, "r", encoding="utf-8") as f:
                                component_code = f.read()
                            print(f"Reading component from: {alt_path}")
                            component_path = alt_path
                            break
                        except Exception:
                            continue
                else:  # No alternative path found
                    return {
                        "error": f"Component '{component_path}' not found.",
                        "message": f"Failed to modify component: Component not found."
                    }

            # Modify the component
            try:
                print("\nModifying component...")
                modified_component = self.agent.modify_component(component_code, modifications, options)
                print("Modification completed.")
            except Exception as e:
                return {
                    "error": f"Error modifying component: {str(e)}",
                    "message": f"Failed to modify component: {str(e)}"
                }

            # Determine output path if not provided
            if not output_path:
                output_path = component_path

            # Save the modified component
            try:
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(modified_component["code"])
                print(f"\nModified component saved to: {output_path}")
            except Exception as e:
                return {
                    "error": f"Error saving modified component: {str(e)}",
                    "message": f"Failed to save modified component: {str(e)}"
                }

            return {
                "result": modified_component,
                "file_path": output_path,
                "message": f"Component modification completed successfully. Saved to {os.path.relpath(output_path, PROJECT_ROOT)}."
            }
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            return {
                "error": f"Error modifying component: {str(e)}",
                "traceback": error_traceback,
                "message": f"Failed to modify component: {str(e)}"
            }


class ListModelsTool(AgentTool):
    """Tool for listing available models."""

    def __init__(self, agent: ComponentAgent):
        super().__init__(
            name="list_models",
            description="List available models that can be used for generation."
        )
        self.agent = agent

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the list models tool."""
        page_size = args.get("page_size", 10)

        print("\nListing available models...")
        pager = self.agent.client.models.list(config={'page_size': page_size})
        models = [model for model in pager]

        model_info = []
        for model in models:
            info = {
                "name": model.name
            }
            if hasattr(model, 'description') and model.description:
                info["description"] = model.description
            if hasattr(model, 'input_token_limit') and model.input_token_limit:
                info["input_token_limit"] = model.input_token_limit
            if hasattr(model, 'output_token_limit') and model.output_token_limit:
                info["output_token_limit"] = model.output_token_limit
            model_info.append(info)

        return {
            "result": model_info,
            "message": f"Found {len(models)} models."
        }


class ListProjectFilesTool(AgentTool):
    """Tool for listing files in the project."""

    def __init__(self):
        super().__init__(
            name="list_project_files",
            description="List files in the project directory with optional pattern matching. Supports recursive search and multiple patterns."
        )

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the list project files tool."""
        directory = args.get("directory", "src")
        pattern = args.get("pattern", "**/*.*")
        exclude = args.get("exclude", ["node_modules", ".git", "__pycache__", "dist", "build"])
        recursive = args.get("recursive", True)
        search_term = args.get("search_term", None)
        case_sensitive = args.get("case_sensitive", False)

        # Handle multiple directories
        directories = [directory] if isinstance(directory, str) else directory

        # Handle multiple patterns
        patterns = [pattern] if isinstance(pattern, str) else pattern

        # If search_term is provided, create patterns for it
        if search_term:
            # Create patterns for common file extensions
            search_patterns = [
                f"**/*{search_term}*.*",  # Any file containing search_term
                f"**/{search_term}*.*",   # Files starting with search_term
                f"**/*{search_term}.*"    # Files ending with search_term (before extension)
            ]
            patterns = search_patterns if not patterns or patterns == ["**/*.*"] else patterns + search_patterns

        all_files = []
        searched_dirs = []

        # Process each directory
        for dir_name in directories:
            # Resolve the directory path
            if dir_name.startswith("/") or dir_name.startswith("\\") or ":" in dir_name:
                # Absolute path
                dir_path = dir_name
            else:
                # Relative to project root
                dir_path = os.path.join(PROJECT_ROOT, dir_name)

            # If directory doesn't exist, try some common alternatives
            if not os.path.exists(dir_path):
                # Try common directory names
                alternatives = [
                    os.path.join(PROJECT_ROOT, "src", dir_name),
                    os.path.join(PROJECT_ROOT, "src", "components", dir_name),
                    os.path.join(PROJECT_ROOT, "src", "pages", dir_name),
                    os.path.join(PROJECT_ROOT, "src", "views", dir_name),
                    os.path.join(PROJECT_ROOT, "src", "containers", dir_name),
                    os.path.join(PROJECT_ROOT, "components", dir_name),
                    os.path.join(PROJECT_ROOT, "pages", dir_name)
                ]

                # Check alternatives
                found_alternative = False
                for alt_path in alternatives:
                    if os.path.exists(alt_path):
                        dir_path = alt_path
                        found_alternative = True
                        break

                if not found_alternative:
                    # Skip this directory but continue with others
                    continue

            searched_dirs.append(os.path.relpath(dir_path, PROJECT_ROOT))

            # Process each pattern
            for pat in patterns:
                # Build the full pattern
                full_pattern = os.path.join(dir_path, pat)

                # List files
                for file_path in glob.glob(full_pattern, recursive=recursive):
                    # Check if the file should be excluded
                    if not any(excl in file_path for excl in exclude) and os.path.isfile(file_path):
                        # Convert to relative path from project root
                        rel_path = os.path.relpath(file_path, PROJECT_ROOT)

                        # If search_term is provided, check if it's in the filename
                        if search_term:
                            filename = os.path.basename(file_path)
                            if case_sensitive:
                                if search_term in filename:
                                    all_files.append(rel_path)
                            else:
                                if search_term.lower() in filename.lower():
                                    all_files.append(rel_path)
                        else:
                            all_files.append(rel_path)

        # Remove duplicates while preserving order
        unique_files = []
        for file in all_files:
            if file not in unique_files:
                unique_files.append(file)

        # If no files found and search_term is provided, try a more flexible search
        if not unique_files and search_term:
            # Try searching in more directories
            fallback_dirs = ["src", "src/components", "src/pages", "src/views", "components", "pages"]
            for dir_name in fallback_dirs:
                if dir_name not in searched_dirs:
                    dir_path = os.path.join(PROJECT_ROOT, dir_name)
                    if os.path.exists(dir_path):
                        searched_dirs.append(dir_name)
                        # Use a more flexible pattern
                        for file_path in glob.glob(os.path.join(dir_path, "**/*.*"), recursive=True):
                            if not any(excl in file_path for excl in exclude) and os.path.isfile(file_path):
                                rel_path = os.path.relpath(file_path, PROJECT_ROOT)
                                filename = os.path.basename(file_path)
                                if case_sensitive:
                                    if search_term in filename:
                                        unique_files.append(rel_path)
                                else:
                                    if search_term.lower() in filename.lower():
                                        unique_files.append(rel_path)

        return {
            "result": unique_files,
            "searched_directories": searched_dirs,
            "patterns_used": patterns,
            "message": f"Found {len(unique_files)} files matching your criteria in {len(searched_dirs)} directories."
        }


class ReadFileTool(AgentTool):
    """Tool for reading file content."""

    def __init__(self):
        super().__init__(
            name="read_file",
            description="Read the content of a file in the project."
        )

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the read file tool."""
        file_path = args.get("file_path")
        if not file_path:
            return {
                "error": "No file path provided.",
                "message": "Failed to read file: No file path provided."
            }

        # Normalize path (replace backslashes with forward slashes)
        if isinstance(file_path, str):
            file_path = file_path.replace("\\", "/")

        # Resolve the file path
        if isinstance(file_path, str) and (file_path.startswith("/") or ":" in file_path):
            # Absolute path
            full_path = file_path
        else:
            # Relative to project root
            full_path = os.path.join(PROJECT_ROOT, file_path)

        # Make sure the file exists
        if not os.path.exists(full_path):
            # Try alternative paths
            alternative_paths = [
                os.path.join(PROJECT_ROOT, "src", file_path),
                os.path.join(PROJECT_ROOT, "src", "components", file_path),
                os.path.join(PROJECT_ROOT, "src", "pages", file_path),
                os.path.join(PROJECT_ROOT, "src", "components", "clinical", file_path),
                os.path.join(PROJECT_ROOT, "src", "components", "clinical", "dynamic-wizard", file_path)
            ]

            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    full_path = alt_path
                    break
            else:  # No alternative path found
                return {
                    "error": f"File '{file_path}' does not exist.",
                    "message": f"Failed to read file '{file_path}'. Tried multiple locations but couldn't find the file."
                }

        # Read the file content
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            return {
                "result": content,
                "file_path": full_path,
                "message": f"Successfully read file '{os.path.relpath(full_path, PROJECT_ROOT)}'."
            }
        except Exception as e:
            return {
                "error": str(e),
                "message": f"Failed to read file '{file_path}': {str(e)}"
            }


class WriteFileTool(AgentTool):
    """Tool for writing content to a file."""

    def __init__(self):
        super().__init__(
            name="write_file",
            description="Write content to a file in the project."
        )

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the write file tool."""
        file_path = args.get("file_path")
        content = args.get("content")
        overwrite = args.get("overwrite", False)

        if not file_path:
            return {
                "error": "No file path provided.",
                "message": "Failed to write file: No file path provided."
            }

        if content is None:
            return {
                "error": "No content provided.",
                "message": "Failed to write file: No content provided."
            }

        # Resolve the file path
        if file_path.startswith("/") or file_path.startswith("\\") or ":" in file_path:
            # Absolute path
            full_path = file_path
        else:
            # Relative to project root
            full_path = os.path.join(PROJECT_ROOT, file_path)

        # Check if the file exists and we're not allowed to overwrite
        if os.path.exists(full_path) and not overwrite:
            return {
                "error": f"File '{file_path}' already exists and overwrite is not allowed.",
                "message": f"Failed to write file '{file_path}': File already exists."
            }

        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        # Write the content to the file
        try:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)

            return {
                "result": full_path,
                "message": f"Successfully wrote to file '{file_path}'."
            }
        except Exception as e:
            return {
                "error": str(e),
                "message": f"Failed to write file '{file_path}': {str(e)}"
            }


class SearchCodeTool(AgentTool):
    """Tool for searching code in the project."""

    def __init__(self):
        super().__init__(
            name="search_code",
            description="Search for code patterns in the project files. Can search by text, regex, imports, component names, or function names."
        )

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the search code tool."""
        query = args.get("query")
        directory = args.get("directory", "src")
        file_pattern = args.get("file_pattern", "**/*.{js,jsx,ts,tsx}")
        exclude = args.get("exclude", ["node_modules", ".git", "__pycache__", "dist", "build"])
        case_sensitive = args.get("case_sensitive", False)
        max_results = args.get("max_results", 50)
        search_type = args.get("search_type", "text")  # text, regex, import, component, function
        context_lines = args.get("context_lines", 1)  # Number of lines of context to include

        if not query:
            return {
                "error": "No search query provided.",
                "message": "Failed to search code: No query provided."
            }

        # Handle multiple directories
        directories = [directory] if isinstance(directory, str) else directory

        # Handle multiple patterns
        file_patterns = [file_pattern] if isinstance(file_pattern, str) else file_pattern

        # Prepare search patterns based on search_type
        import re
        search_patterns = []

        if search_type == "text":
            # Simple text search
            search_patterns.append(re.compile(re.escape(query), flags=0 if case_sensitive else re.IGNORECASE))
        elif search_type == "regex":
            # Regex search
            search_patterns.append(re.compile(query, flags=0 if case_sensitive else re.IGNORECASE))
        elif search_type == "import":
            # Search for imports
            search_patterns.extend([
                re.compile(rf"import\s+{re.escape(query)}\s+from", flags=0 if case_sensitive else re.IGNORECASE),
                re.compile(rf"import\s+\{{[^}}]*{re.escape(query)}[^}}]*\}}\s+from", flags=0 if case_sensitive else re.IGNORECASE),
                re.compile(rf"require\(['\"].*{re.escape(query)}.*['\"]\)", flags=0 if case_sensitive else re.IGNORECASE)
            ])
        elif search_type == "component":
            # Search for component definitions
            search_patterns.extend([
                re.compile(rf"function\s+{re.escape(query)}\s*\(", flags=0 if case_sensitive else re.IGNORECASE),
                re.compile(rf"const\s+{re.escape(query)}\s*=\s*\(.*\)\s*=>\s*\{{", flags=0 if case_sensitive else re.IGNORECASE),
                re.compile(rf"class\s+{re.escape(query)}\s+extends\s+React\.Component", flags=0 if case_sensitive else re.IGNORECASE),
                re.compile(rf"<{re.escape(query)}[\s>]", flags=0 if case_sensitive else re.IGNORECASE)
            ])
        elif search_type == "function":
            # Search for function definitions
            search_patterns.extend([
                re.compile(rf"function\s+{re.escape(query)}\s*\(", flags=0 if case_sensitive else re.IGNORECASE),
                re.compile(rf"const\s+{re.escape(query)}\s*=\s*\(.*\)\s*=>", flags=0 if case_sensitive else re.IGNORECASE),
                re.compile(rf"const\s+{re.escape(query)}\s*=\s*function\s*\(", flags=0 if case_sensitive else re.IGNORECASE)
            ])
        else:
            # Default to text search
            search_patterns.append(re.compile(re.escape(query), flags=0 if case_sensitive else re.IGNORECASE))

        # Search for the query in files
        results = []
        searched_dirs = []

        # Process each directory
        for dir_name in directories:
            # Resolve the directory path
            if dir_name.startswith("/") or dir_name.startswith("\\") or ":" in dir_name:
                # Absolute path
                dir_path = dir_name
            else:
                # Relative to project root
                dir_path = os.path.join(PROJECT_ROOT, dir_name)

            # If directory doesn't exist, try some common alternatives
            if not os.path.exists(dir_path):
                # Try common directory names
                alternatives = [
                    os.path.join(PROJECT_ROOT, "src", dir_name),
                    os.path.join(PROJECT_ROOT, "src", "components", dir_name),
                    os.path.join(PROJECT_ROOT, "src", "pages", dir_name),
                    os.path.join(PROJECT_ROOT, "components", dir_name),
                    os.path.join(PROJECT_ROOT, "pages", dir_name)
                ]

                # Check alternatives
                found_alternative = False
                for alt_path in alternatives:
                    if os.path.exists(alt_path):
                        dir_path = alt_path
                        found_alternative = True
                        break

                if not found_alternative:
                    # Skip this directory but continue with others
                    continue

            searched_dirs.append(os.path.relpath(dir_path, PROJECT_ROOT))

            # Process each file pattern
            for pat in file_patterns:
                # Build the full pattern
                full_pattern = os.path.join(dir_path, pat)

                # Search files
                for file_path in glob.glob(full_pattern, recursive=True):
                    # Check if the file should be excluded
                    if any(excl in file_path for excl in exclude):
                        continue

                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()

                        # Split content into lines for context
                        lines = content.split('\n')

                        # Search for matches using all patterns
                        for pattern in search_patterns:
                            matches = pattern.finditer(content)
                            for match in matches:
                                # Get the line number and context
                                line_num = content[:match.start()].count('\n') + 1

                                # Get context lines
                                start_line = max(0, line_num - context_lines - 1)
                                end_line = min(len(lines), line_num + context_lines)

                                # Extract the matched line and context
                                matched_line = lines[line_num - 1] if line_num <= len(lines) else ""
                                context_before = lines[start_line:line_num-1] if line_num > 1 else []
                                context_after = lines[line_num:end_line] if line_num < len(lines) else []

                                # Format context
                                context_text = "\n".join(context_before + [matched_line] + context_after)

                                # Add the result
                                rel_path = os.path.relpath(file_path, PROJECT_ROOT)
                                results.append({
                                    "file": rel_path,
                                    "line": line_num,
                                    "match": match.group(0),
                                    "matched_line": matched_line.strip(),
                                    "context": context_text.strip()
                                })

                                # Check if we've reached the maximum number of results
                                if len(results) >= max_results:
                                    break

                            # Check if we've reached the maximum number of results
                            if len(results) >= max_results:
                                break
                    except Exception:
                        # Skip files that can't be read
                        continue

                    # Check if we've reached the maximum number of results
                    if len(results) >= max_results:
                        break

        # If no results found, try a more flexible search
        if not results:
            # Try searching with a more flexible approach
            fallback_dirs = ["src", "src/components", "src/pages", "src/views"]
            for dir_name in fallback_dirs:
                if dir_name not in searched_dirs:
                    dir_path = os.path.join(PROJECT_ROOT, dir_name)
                    if os.path.exists(dir_path):
                        searched_dirs.append(dir_name)
                        # Use a more flexible pattern
                        for file_path in glob.glob(os.path.join(dir_path, "**/*.*"), recursive=True):
                            if any(excl in file_path for excl in exclude):
                                continue

                            try:
                                with open(file_path, "r", encoding="utf-8") as f:
                                    content = f.read()

                                # Simple case-insensitive search
                                search_content = content if case_sensitive else content.lower()
                                search_query = query if case_sensitive else query.lower()

                                if search_query in search_content:
                                    # Found a match, get the context
                                    lines = content.split('\n')
                                    for i, line in enumerate(lines):
                                        line_search = line if case_sensitive else line.lower()
                                        if search_query in line_search:
                                            # Get context lines
                                            start_line = max(0, i - context_lines)
                                            end_line = min(len(lines), i + context_lines + 1)

                                            # Extract context
                                            context_text = "\n".join(lines[start_line:end_line])

                                            # Add the result
                                            rel_path = os.path.relpath(file_path, PROJECT_ROOT)
                                            results.append({
                                                "file": rel_path,
                                                "line": i + 1,
                                                "match": query,
                                                "matched_line": line.strip(),
                                                "context": context_text.strip()
                                            })

                                            # Check if we've reached the maximum number of results
                                            if len(results) >= max_results:
                                                break

                                    # Check if we've reached the maximum number of results
                                    if len(results) >= max_results:
                                        break
                            except Exception:
                                # Skip files that can't be read
                                continue

                            # Check if we've reached the maximum number of results
                            if len(results) >= max_results:
                                break

        return {
            "result": results,
            "searched_directories": searched_dirs,
            "message": f"Found {len(results)} matches for '{query}' in {len(searched_dirs)} directories."
        }


class CreateComponentTool(AgentTool):
    """Tool for creating a new React component."""

    def __init__(self, agent: ComponentAgent):
        super().__init__(
            name="create_component",
            description="Create a new React component in the project."
        )
        self.agent = agent

    def execute(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the create component tool."""
        try:
            # Extract arguments with better error handling
            name = args.get("name")
            if not name:
                return {
                    "error": "No component name provided.",
                    "message": "Failed to create component: No name provided."
                }

            # Get other arguments with defaults
            directory = args.get("directory", "src/components")
            type_script = args.get("typescript", True)
            props = args.get("props", [])
            description = args.get("description", f"A {name} component")
            styling = args.get("styling", "tailwind")
            template = args.get("template")
            component_path = args.get("file_path")

            # Normalize path if provided
            if component_path and isinstance(component_path, str):
                component_path = component_path.replace("\\", "/")

                # If absolute path is provided, use it directly
                if component_path.startswith("/") or ":" in component_path:
                    # Extract directory and name from the path
                    directory = os.path.dirname(component_path)
                    name = os.path.basename(component_path).split(".")[0]

            # Build the component specification
            spec = {
                "name": name,
                "description": description,
                "props": props,
                "functionality": args.get("functionality", f"The {name} component should render its children and handle any provided props."),
                "styling": args.get("styling_description", f"Use {styling} for styling.")
            }

            # If template is provided, use it
            if template:
                spec["template"] = template

            # Set up generation options
            options = {
                "typescript": type_script,
                "style": "functional",
                "tailwind": styling == "tailwind"
            }

            # Generate the component
            print(f"\nGenerating {name} component...")
            try:
                component = self.agent.generate_component(spec, options)
                print("Generation completed.")
            except Exception as e:
                print(f"Error generating component: {str(e)}")
                # If template is provided, use it directly as the component code
                if template:
                    component = {"code": template}
                else:
                    raise

            # Determine the file extension
            ext = ".tsx" if type_script else ".jsx"

            # Resolve the directory path
            if directory.startswith("/") or directory.startswith("\\") or ":" in directory:
                # Absolute path
                dir_path = directory
            else:
                # Relative to project root
                dir_path = os.path.join(PROJECT_ROOT, directory)

            # Create the directory if it doesn't exist
            os.makedirs(dir_path, exist_ok=True)

            # Save the component
            file_path = os.path.join(dir_path, f"{name}{ext}")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(component["code"])

            return {
                "result": {
                    "file_path": os.path.relpath(file_path, PROJECT_ROOT),
                    "code": component["code"]
                },
                "message": f"Successfully created {name} component at '{os.path.relpath(file_path, PROJECT_ROOT)}'."
            }
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            return {
                "error": f"Error creating component: {str(e)}",
                "traceback": error_traceback,
                "message": f"Failed to create component: {str(e)}"
            }


class ComponentAgentChat:
    """Interactive chat interface for the component agent."""

    def __init__(self, model_name: str = "gemini-2.5-pro-exp-03-25", system_prompt: Optional[str] = None):
        """
        Initialize the component agent chat.

        Args:
            model_name: The name of the model to use for the chat.
            system_prompt: Custom system prompt to use. If not provided, a default prompt will be used.
        """
        # Initialize the component agent
        self.agent = ComponentAgent(model_name=model_name, system_prompt=system_prompt)

        # Initialize the tools
        self.tools = [
            AnalyzeComponentTool(self.agent),
            GenerateComponentTool(self.agent),
            ModifyComponentTool(self.agent),
            ListModelsTool(self.agent),
            ListProjectFilesTool(),
            ReadFileTool(),
            WriteFileTool(),
            SearchCodeTool(),
            CreateComponentTool(self.agent)
        ]

        # Create a chat session
        self.chat = self.agent.client.chats.create(model=model_name)

        # Set up the system prompt for the chat
        self.system_prompt = system_prompt or self._get_default_system_prompt()

    def _get_default_system_prompt(self) -> str:
        """Get the default system prompt for the chat."""
        tools_description = "\n".join([
            f"- {tool.name}: {tool.description}" for tool in self.tools
        ])

        # Get project structure information
        project_info = self._get_project_info()

        return f"""
You are an expert React Component Developer assistant with FULL AUTONOMY. Your primary task is to help users analyze, generate, and modify React components using the component-agent framework. You are designed to be PROACTIVE and AUTONOMOUS, taking initiative to solve problems without asking unnecessary questions.

# Project Information
{project_info}

# Available Tools
You have access to the following tools:
{tools_description}

# Core Principles
1. AUTONOMY: You are an autonomous agent. Take initiative and solve problems without asking for information you can find yourself.
2. PROACTIVITY: Anticipate needs and use tools proactively to gather information before asking questions.
3. PERSISTENCE: If one approach fails, try alternative approaches. Don't give up easily.
4. THOROUGHNESS: Be thorough in your searches and explorations of the codebase.

# Workflow
When a user asks you to perform a task:
1. Understand the user's request
2. IMMEDIATELY use tools to gather any information you need - DO NOT ask the user for information you can find yourself
3. Execute a sequence of tools as needed to complete the task
4. Present the results clearly

# Tool Usage Sequence
For most tasks, you should follow this sequence:
1. Use list_project_files to find relevant files
2. If you don't find what you need, try different patterns or directories
3. Use search_code to find specific code patterns
4. Use read_file to examine file contents
5. Use the appropriate tool to complete the task (analyze_component, generate_component, etc.)

# Search Strategies
If you don't find what you're looking for immediately:
1. Try different directories (src, src/components, src/pages, etc.)
2. Try different patterns (*.tsx, *.jsx, *Button*.tsx, etc.)
3. Try searching for related terms (if looking for a button, search for "button", "btn", etc.)
4. Look for index files that might import or export the component

# Important Instructions
- NEVER ask for information you can obtain yourself using the tools
- If you need to know what files exist, use list_project_files
- If you need to see a file's content, use read_file
- If you need to search for code patterns, use search_code
- If a search returns no results, try different search terms or patterns
- Always execute tools immediately without asking for permission
- Chain multiple tool calls together to complete complex tasks

# Specific Tool Usage Tips

## list_project_files
- Use search_term parameter to find files by name (e.g., search_term="button")
- Try multiple directories if you don't find what you need (e.g., directory=["src", "src/components", "src/pages"])
- Use pattern parameter for specific file types (e.g., pattern="**/*.tsx")

## search_code
- Use search_type parameter to specify what you're looking for ("text", "regex", "import", "component", "function")
- Try multiple directories if you don't find what you need
- Use context_lines parameter to get more context around matches

## read_file
- Always use this to examine file contents after finding files
- If a file doesn't exist, try different paths or use list_project_files to find it

# Examples of Autonomous Behavior

User: "Show me the Button component"
BAD: "Where is the Button component located?"
GOOD: *Immediately use list_project_files with search_term="button" to find Button components, then read_file to show the content*

User: "Find components that use useState"
BAD: "In which directory should I search?"
GOOD: *Immediately use search_code with query="useState" and search_type="import" across the project*

User: "Show me the components in the reports page"
BAD: "Where is the reports page located?"
GOOD: *First search for files with 'report' in the name using list_project_files with search_term="report", then examine those files to identify components, and finally show the relevant components using read_file*

User: "Find the dynamic-wizard folder"
BAD: "Where should I look for the dynamic-wizard folder?"
GOOD: *Immediately use list_project_files with multiple directories and search_term="dynamic-wizard" to find the folder*

# CRITICAL INSTRUCTION
You are a fully autonomous agent. Use your tools proactively and persistently to complete tasks without asking unnecessary questions. If you don't find what you're looking for with one approach, try different approaches until you succeed. NEVER ask the user for information that you can find yourself using the tools.
"""

    def _get_project_info(self) -> str:
        """Get information about the project structure."""
        try:
            # List files in the src directory
            src_files_tool = ListProjectFilesTool()
            src_files_result = src_files_tool.execute({"directory": "src", "pattern": "**/*.{js,jsx,ts,tsx}"})

            # Count files by type
            file_types = {}
            for file in src_files_result.get("result", []):
                ext = os.path.splitext(file)[1]
                file_types[ext] = file_types.get(ext, 0) + 1

            # Format file type counts
            file_type_info = "\n".join([f"- {ext}: {count} files" for ext, count in file_types.items()])

            # Try to find package.json to get dependencies
            dependencies = []
            try:
                package_json_path = os.path.join(PROJECT_ROOT, "package.json")
                if os.path.exists(package_json_path):
                    with open(package_json_path, "r", encoding="utf-8") as f:
                        package_data = json.load(f)
                        dependencies = list(package_data.get("dependencies", {}).keys())
            except Exception:
                pass

            # Format dependencies
            dependencies_info = "\n".join([f"- {dep}" for dep in dependencies[:10]]) if dependencies else "No dependencies found"

            return f"""## Project Structure
The project is located at: {PROJECT_ROOT}

### File Types
{file_type_info}

### Key Dependencies
{dependencies_info}

### Source Directory
The main source code is in the 'src' directory. This is where you should focus your attention.
"""
        except Exception as e:
            return f"""## Project Structure
Unable to analyze project structure: {str(e)}

The project is located at: {PROJECT_ROOT}
The main source code is likely in the 'src' directory.
"""

    def _format_tool_args(self, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """Format the arguments for a tool call."""
        if tool_name == "analyze_component":
            return {
                "component_path": args.get("component_path"),
                "options": {
                    "accessibility": args.get("accessibility", False),
                    "performance": args.get("performance", False),
                    "bestPractices": args.get("best_practices", False),
                    "config": args.get("config", {})
                }
            }
        elif tool_name == "generate_component":
            return {
                "spec": args.get("spec"),
                "options": args.get("options", {}),
                "output_path": args.get("output_path"),
                "stream": args.get("stream", False)
            }
        elif tool_name == "modify_component":
            return {
                "component_path": args.get("component_path"),
                "modifications": args.get("modifications"),
                "options": args.get("options", {}),
                "output_path": args.get("output_path")
            }
        elif tool_name == "list_models":
            return {
                "page_size": args.get("page_size", 10)
            }
        return args

    def _get_tool_by_name(self, name: str) -> Optional[AgentTool]:
        """Get a tool by its name."""
        for tool in self.tools:
            if tool.name == name:
                return tool
        return None

    def _extract_tool_call(self, message: str) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        """Extract a tool call from a message."""
        # Look for tool call patterns in the message
        if "```json" in message and "```" in message.split("```json")[1]:
            # Extract the JSON between the code blocks
            json_str = message.split("```json")[1].split("```")[0].strip()
            try:
                tool_call = json.loads(json_str)
                return tool_call.get("tool"), tool_call.get("args", {})
            except json.JSONDecodeError:
                pass

        # Look for explicit tool mentions
        for tool in self.tools:
            # Check for explicit tool call patterns
            patterns = [
                f"Use the {tool.name} tool",
                f"Call the {tool.name} tool",
                f"Using the {tool.name} tool",
                f"Let me use the {tool.name} tool",
                f"I'll use the {tool.name} tool",
                f"I will use the {tool.name} tool",
                f"Let's use the {tool.name} tool"
            ]

            if any(pattern in message for pattern in patterns):
                # Extract arguments based on the tool type
                args = self._extract_args_for_tool(tool.name, message)
                return tool.name, args

        # Look for implicit tool mentions based on intent
        intent_patterns = {
            "analyze_component": [
                "analyze", "examine", "review", "check", "evaluate", "assess"
            ],
            "generate_component": [
                "generate", "create", "make", "build", "develop", "produce"
            ],
            "modify_component": [
                "modify", "change", "update", "edit", "alter", "improve", "enhance"
            ],
            "list_models": [
                "list models", "show models", "available models", "what models", "which models"
            ],
            "list_project_files": [
                "list files", "show files", "find files", "what files", "directory listing", "ls", "dir"
            ],
            "read_file": [
                "read file", "show file", "display file", "cat file", "view file", "open file", "content of file"
            ],
            "write_file": [
                "write file", "save file", "create file", "make file", "output to file"
            ],
            "search_code": [
                "search code", "find code", "look for code", "search for", "find pattern", "search pattern", "grep"
            ],
            "create_component": [
                "create component", "new component", "make component", "generate component", "build component"
            ]
        }

        for tool_name, patterns in intent_patterns.items():
            if any(pattern in message.lower() for pattern in patterns):
                args = self._extract_args_for_tool(tool_name, message)
                return tool_name, args

        return None, None

    def _extract_args_for_tool(self, tool_name: str, message: str) -> Dict[str, Any]:
        """Extract arguments for a specific tool from a message."""
        args = {}

        # Common arguments
        if "component_path" in message or "file path" in message or "path to the component" in message:
            args["component_path"] = self._extract_value(message, "component_path") or self._extract_value(message, "file path") or self._extract_value(message, "path")

        if "output_path" in message or "save to" in message or "output file" in message:
            args["output_path"] = self._extract_value(message, "output_path") or self._extract_value(message, "save to") or self._extract_value(message, "output file")

        # Tool-specific arguments
        if tool_name == "analyze_component":
            if "accessibility" in message.lower():
                args["accessibility"] = True
            if "performance" in message.lower():
                args["performance"] = True
            if "best practices" in message.lower() or "bestpractices" in message.lower():
                args["best_practices"] = True

        elif tool_name == "generate_component" or tool_name == "create_component":
            if "stream" in message.lower():
                args["stream"] = True
            if "typescript" in message.lower() or "tsx" in message.lower():
                args["typescript"] = True
            if "javascript" in message.lower() or "jsx" in message.lower():
                args["typescript"] = False

            # Try to extract component name
            name_patterns = [
                r"component named ([\w-]+)",
                r"create a ([\w-]+) component",
                r"generate a ([\w-]+) component",
                r"new ([\w-]+) component",
                r"component called ([\w-]+)"
            ]
            import re
            for pattern in name_patterns:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    args["name"] = match.group(1)
                    break

            # Try to extract spec path
            if "spec" in message.lower() or "specification" in message.lower():
                spec_path = self._extract_value(message, "spec") or self._extract_value(message, "specification")
                if spec_path:
                    # If it's a path to a JSON file, read it
                    if os.path.exists(os.path.join(PROJECT_ROOT, spec_path)):
                        try:
                            with open(os.path.join(PROJECT_ROOT, spec_path), "r", encoding="utf-8") as f:
                                args["spec"] = json.load(f)
                        except Exception:
                            pass

        elif tool_name == "list_project_files":
            # Try to extract directory and pattern
            if "directory" in message or "folder" in message or "in the" in message:
                dir_value = self._extract_value(message, "directory") or self._extract_value(message, "folder")
                if dir_value:
                    # Check if it's a list of directories
                    if "," in dir_value:
                        args["directory"] = [d.strip() for d in dir_value.split(",")]
                    else:
                        args["directory"] = dir_value

            # Try to extract pattern
            if "pattern" in message or "matching" in message or "with extension" in message:
                pattern_value = self._extract_value(message, "pattern") or self._extract_value(message, "matching")
                if pattern_value:
                    # Check if it's a list of patterns
                    if "," in pattern_value:
                        args["pattern"] = [p.strip() for p in pattern_value.split(",")]
                    else:
                        args["pattern"] = pattern_value

            # Try to extract search term
            if "search term" in message or "search for" in message or "find" in message or "named" in message:
                args["search_term"] = self._extract_value(message, "search term") or self._extract_value(message, "search for") or self._extract_value(message, "find") or self._extract_value(message, "named")

                # If no explicit search term but there are keywords that might be search terms
                if not args.get("search_term"):
                    # Look for patterns like "find files with 'xyz' in the name"
                    search_patterns = [
                        r"with ['\"](.*?)['\"]",
                        r"containing ['\"](.*?)['\"]",
                        r"named ['\"](.*?)['\"]",
                        r"called ['\"](.*?)['\"]"
                    ]
                    for pattern in search_patterns:
                        match = re.search(pattern, message, re.IGNORECASE)
                        if match:
                            args["search_term"] = match.group(1)
                            break

            # Extract recursive flag
            if "recursive" in message:
                args["recursive"] = "non-recursive" not in message.lower() and "not recursive" not in message.lower()

        elif tool_name == "read_file":
            # Try to extract file path
            if "file" in message:
                args["file_path"] = self._extract_value(message, "file") or self._extract_value(message, "path")

                # If no explicit file path but there are keywords that might be file paths
                if not args.get("file_path"):
                    # Look for patterns like "read 'xyz.js'"
                    file_patterns = [
                        r"read ['\"](.*?)['\"]",
                        r"show ['\"](.*?)['\"]",
                        r"open ['\"](.*?)['\"]",
                        r"content of ['\"](.*?)['\"]"
                    ]
                    for pattern in file_patterns:
                        match = re.search(pattern, message, re.IGNORECASE)
                        if match:
                            args["file_path"] = match.group(1)
                            break

        elif tool_name == "write_file":
            # Try to extract file path and content
            if "file" in message:
                args["file_path"] = self._extract_value(message, "file") or self._extract_value(message, "path")

            if "content" in message or "with the following" in message:
                args["content"] = self._extract_value(message, "content")

            if "overwrite" in message:
                args["overwrite"] = True

        elif tool_name == "search_code":
            # Try to extract query
            if "query" in message or "search for" in message or "find" in message or "pattern" in message:
                args["query"] = self._extract_value(message, "query") or self._extract_value(message, "search for") or self._extract_value(message, "find") or self._extract_value(message, "pattern")

                # If no explicit query but there are keywords that might be queries
                if not args.get("query"):
                    # Look for patterns like "search for 'xyz'"
                    query_patterns = [
                        r"search for ['\"](.*?)['\"]",
                        r"find ['\"](.*?)['\"]",
                        r"containing ['\"](.*?)['\"]",
                        r"with ['\"](.*?)['\"]"
                    ]
                    for pattern in query_patterns:
                        match = re.search(pattern, message, re.IGNORECASE)
                        if match:
                            args["query"] = match.group(1)
                            break

            # Try to extract directory
            if "directory" in message or "folder" in message or "in the" in message:
                dir_value = self._extract_value(message, "directory") or self._extract_value(message, "folder")
                if dir_value:
                    # Check if it's a list of directories
                    if "," in dir_value:
                        args["directory"] = [d.strip() for d in dir_value.split(",")]
                    else:
                        args["directory"] = dir_value

            # Try to extract search type
            if "search type" in message or "search by" in message:
                args["search_type"] = self._extract_value(message, "search type") or self._extract_value(message, "search by")
            else:
                # Try to infer search type from context
                if "import" in message.lower() or "require" in message.lower():
                    args["search_type"] = "import"
                elif "component" in message.lower() and "definition" in message.lower():
                    args["search_type"] = "component"
                elif "function" in message.lower() and "definition" in message.lower():
                    args["search_type"] = "function"
                elif "regex" in message.lower() or "regular expression" in message.lower():
                    args["search_type"] = "regex"

            # Try to extract context lines
            if "context lines" in message or "lines of context" in message:
                context_lines = self._extract_value(message, "context lines") or self._extract_value(message, "lines of context")
                if context_lines and context_lines.isdigit():
                    args["context_lines"] = int(context_lines)

            # Try to extract case sensitivity
            if "case sensitive" in message:
                args["case_sensitive"] = "not case sensitive" not in message.lower() and "case insensitive" not in message.lower()

            # Try to extract file pattern
            if "file pattern" in message or "file extension" in message or "file type" in message:
                args["file_pattern"] = self._extract_value(message, "file pattern") or self._extract_value(message, "file extension") or self._extract_value(message, "file type")

        return args

    def _extract_value(self, message: str, key: str) -> Optional[str]:
        """Extract a value from a message based on a key."""
        # Look for patterns like 'key: "value"' or 'key = "value"'
        patterns = [
            f'{key}["\']?:["\']? ?["\']([^"\']+)["\']',
            f'{key}["\']? ?= ?["\']([^"\']+)["\']',
            f'{key}: ([^ \n]+)',
            f'{key}=([^ \n]+)'
        ]

        import re
        for pattern in patterns:
            match = re.search(pattern, message)
            if match:
                return match.group(1)

        return None

    def start(self):
        """Start the chat interface."""
        print("\nWelcome to the Component Agent Chat!")
        print("You can interact with the agent using natural language.")
        print("Type 'exit' or 'quit' to end the session.")

        # Send the system prompt to the chat
        self.chat.send_message(self.system_prompt)

        # Chat loop
        while True:
            # Get user input
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit"]:
                break

            # Process the user input and run the agent loop
            self._run_agent_loop(user_input)

        print("\nChat session ended.")

    def _run_agent_loop(self, user_input: str, max_iterations: int = 5):
        """Run the agent loop to process user input and execute tools."""
        # Send message to the model
        print("\nAgent: ", end="")
        response_text = ""
        for chunk in self.chat.send_message_stream(user_input):
            print(chunk.text, end="", flush=True)
            response_text += chunk.text

        # Initialize loop variables
        iterations = 0
        last_tool_result = None
        continue_execution = True

        # Run the agent loop
        while continue_execution and iterations < max_iterations:
            # Check if the response contains a tool call
            tool_name, tool_args = self._extract_tool_call(response_text)

            if not tool_name:
                # No tool call found, end the loop
                break

            # Get the tool
            tool = self._get_tool_by_name(tool_name)
            if not tool:
                # Tool not found, end the loop
                print(f"\n\nTool '{tool_name}' not found.")
                break

            # Execute the tool
            print(f"\n\nExecuting {tool_name} tool...")
            formatted_args = self._format_tool_args(tool_name, tool_args)

            try:
                # Execute the tool
                result = tool.execute(formatted_args)
                result_message = f"\n\nTool execution completed: {result['message']}"
                print(result_message)

                # Send the result back to the chat
                tool_result_message = f"Tool execution result: {json.dumps(result)}"

                # Check if we should continue execution
                if iterations < max_iterations - 1:
                    # Ask the model if it needs to execute more tools
                    tool_result_message += "\n\nDo you need to execute more tools to complete the task? If yes, specify which tool and with what arguments."

                # Send the result to the chat
                print("\nAgent: ", end="")
                response_text = ""
                for chunk in self.chat.send_message_stream(tool_result_message):
                    print(chunk.text, end="", flush=True)
                    response_text += chunk.text

                # Update loop variables
                last_tool_result = result
                iterations += 1

                # Check if we've reached the maximum number of iterations
                if iterations >= max_iterations:
                    print("\n\nReached maximum number of tool executions.")
                    continue_execution = False

                # Check if the response indicates we should stop
                if "no more tools" in response_text.lower() or "task is complete" in response_text.lower() or "completed the task" in response_text.lower():
                    continue_execution = False

            except Exception as e:
                # Handle tool execution errors
                error_message = f"\n\nError executing tool: {str(e)}"
                print(error_message)
                traceback.print_exc()

                # Send the error back to the chat
                print("\nAgent: ", end="")
                response_text = ""
                for chunk in self.chat.send_message_stream(f"Tool execution error: {str(e)}"):
                    print(chunk.text, end="", flush=True)
                    response_text += chunk.text

                # Check if we should continue execution
                if "try again" in response_text.lower() or "try different" in response_text.lower() or "try another" in response_text.lower():
                    # Continue execution
                    iterations += 1
                else:
                    # End the loop
                    continue_execution = False


def setup_parser():
    """Set up the argument parser."""
    parser = argparse.ArgumentParser(description="Component Agent Chat Interface")
    parser.add_argument("--model", default="gemini-2.5-pro-exp-03-25", help="Model to use for the chat (default: gemini-2.5-pro-exp-03-25)")
    parser.add_argument("--system-prompt", help="Path to a custom system prompt file")
    return parser


def main():
    """Main entry point."""
    parser = setup_parser()
    args = parser.parse_args()

    # Load custom system prompt if provided
    system_prompt = None
    if args.system_prompt and os.path.exists(args.system_prompt):
        with open(args.system_prompt, "r", encoding="utf-8") as f:
            system_prompt = f.read()
        print(f"Using custom prompt from: {args.system_prompt}")

    # Start the chat interface
    chat = ComponentAgentChat(model_name=args.model, system_prompt=system_prompt)
    chat.start()


if __name__ == "__main__":
    main()
