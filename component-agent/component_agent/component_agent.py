"""
Component Agent - Main module

This module contains the main ComponentAgent class that provides functionality
for analyzing, generating, and modifying React components.
"""

import os
from typing import Any, Dict, List, Optional, Union, AsyncIterator
from pathlib import Path

import dotenv
from google import genai
from google.genai import types

# Load environment variables from .env file
dotenv.load_dotenv()

from .operations.analysis import ComponentAnalyzer
from .operations.generation import ComponentGenerator
from .operations.modification import ComponentModifier
from .utils.file_handler import FileHandler
from .utils.prompt_builder import PromptBuilder
from .utils.system_prompts import DEFAULT_SYSTEM_PROMPT


class ComponentAgent:
    """
    Main component agent class for analyzing, generating, and modifying React components.

    This class serves as the main entry point for the component agent functionality.
    It provides methods for analyzing existing components, generating new components,
    and modifying existing components based on user requirements.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-pro-exp-03-25", system_prompt: Optional[str] = None):
        """
        Initialize the component agent.

        Args:
            api_key: Google API key. If not provided, it will be read from the GOOGLE_API_KEY environment variable.
            model_name: The name of the model to use for generation. Defaults to "gemini-2.5-pro-exp-03-25".
            system_prompt: Custom system prompt to use. If not provided, the default prompt will be used.
        """
        # Initialize the Google Generative AI client
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key not provided. Please provide an API key or set the GOOGLE_API_KEY environment variable."
            )

        # Create a client with the API key
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name

        # Set the system prompt
        self.system_prompt = system_prompt or DEFAULT_SYSTEM_PROMPT

        # Initialize utility classes
        self.file_handler = FileHandler()
        self.prompt_builder = PromptBuilder(system_prompt=self.system_prompt)

        # Initialize the component operations
        self.analyzer = ComponentAnalyzer(self.model_name, self.client)
        self.generator = ComponentGenerator(self.model_name, self.client)
        self.modifier = ComponentModifier(self.model_name, self.client)

    def analyze_component(
        self,
        component_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze a component and return information about it.

        Args:
            component_path: Path to the component file or component code.
            options: Analysis options.

        Returns:
            A dictionary containing the analysis results.
        """
        # Read the component code if a file path is provided
        component_code = self.file_handler.read_file(component_path) if os.path.exists(component_path) else component_path

        # Analyze the component
        return self.analyzer.analyze(component_code, options or {})

    def generate_component(
        self,
        spec: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a new component based on the provided specification.

        Args:
            spec: Component specification.
            options: Generation options.

        Returns:
            A dictionary containing the generated component.
        """
        # Generate the component
        return self.generator.generate(spec, options or {})

    def modify_component(
        self,
        component_path: str,
        modifications: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Modify an existing component based on the provided modifications.

        Args:
            component_path: Path to the component file or component code.
            modifications: Modifications to apply.
            options: Modification options.

        Returns:
            A dictionary containing the modified component.
        """
        # Read the component code if a file path is provided
        component_code = self.file_handler.read_file(component_path) if os.path.exists(component_path) else component_path

        # Modify the component
        return self.modifier.modify(component_code, modifications, options or {})

    def save_component(
        self,
        component: Dict[str, Any],
        file_path: str,
        overwrite: bool = False
    ) -> str:
        """
        Save a component to a file.

        Args:
            component: Component to save.
            file_path: Path to save the component to.
            overwrite: Whether to overwrite the file if it already exists.

        Returns:
            The path to the saved file.
        """
        # Save the component
        return self.file_handler.write_file(file_path, component["code"], overwrite)

    def generate_component_stream(
        self,
        spec: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ):
        """
        Generate a new component based on the provided specification with streaming output.

        Args:
            spec: Component specification.
            options: Generation options.

        Returns:
            An iterator that yields chunks of the generated component.
        """
        # Generate the component with streaming
        return self.generator.generate_stream(spec, options or {})

    async def analyze_component_async(
        self,
        component_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze a component asynchronously and return information about it.

        Args:
            component_path: Path to the component file or component code.
            options: Analysis options.

        Returns:
            A dictionary containing the analysis results.
        """
        # Read the component code if a file path is provided
        component_code = self.file_handler.read_file(component_path) if os.path.exists(component_path) else component_path

        # Analyze the component asynchronously
        return await self.analyzer.analyze_async(component_code, options or {})

    async def generate_component_async(
        self,
        spec: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a new component asynchronously based on the provided specification.

        Args:
            spec: Component specification.
            options: Generation options.

        Returns:
            A dictionary containing the generated component.
        """
        # Generate the component asynchronously
        return await self.generator.generate_async(spec, options or {})

    async def modify_component_async(
        self,
        component_path: str,
        modifications: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Modify an existing component asynchronously based on the provided modifications.

        Args:
            component_path: Path to the component file or component code.
            modifications: Modifications to apply.
            options: Modification options.

        Returns:
            A dictionary containing the modified component.
        """
        # Read the component code if a file path is provided
        component_code = self.file_handler.read_file(component_path) if os.path.exists(component_path) else component_path

        # Modify the component asynchronously
        return await self.modifier.modify_async(component_code, modifications, options or {})
