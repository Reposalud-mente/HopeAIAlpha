"""
Component Generation Module

This module contains the ComponentGenerator class that provides functionality
for generating React components.
"""

from typing import Any, Dict, List, Optional, Iterator, AsyncIterator

from google import genai
from google.genai import types

from ..utils.prompt_builder import PromptBuilder


class ComponentGenerator:
    """
    Component generator class for generating React components.

    This class provides methods for generating React components based on
    user specifications.
    """

    def __init__(self, model_name: str, client: Optional[genai.Client] = None):
        """
        Initialize the component generator.

        Args:
            model_name: The name of the model to use for generation.
            client: The Google GenAI client to use. If not provided, a new client will be created.
        """
        self.model_name = model_name
        self.prompt_builder = PromptBuilder()
        self.client = client

    def generate(self, spec: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a new component based on the provided specification.

        Args:
            spec: Component specification.
            options: Generation options.

        Returns:
            A dictionary containing the generated component.
        """
        # Build the generation prompt
        prompt = self.prompt_builder.build_generation_prompt(spec, options)
        system_instruction = self.prompt_builder.get_system_instruction("generation")

        # Generate the component with improved configuration
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,  # Higher temperature for more creative generation
                    max_output_tokens=4096,  # Allow for larger components
                    system_instruction=system_instruction,
                    safety_settings=[
                        types.SafetySetting(
                            category="HARM_CATEGORY_HATE_SPEECH",
                            threshold="BLOCK_ONLY_HIGH"
                        ),
                        types.SafetySetting(
                            category="HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold="BLOCK_ONLY_HIGH"
                        )
                    ]
                )
            )

            # Parse the response
            component = self._parse_generation_response(response.text, spec)

        except types.BlockedPromptException as e:
            component = {
                "error": f"Generation blocked due to safety concerns: {str(e)}",
                "raw_response": ""
            }
        except types.GenerationException as e:
            component = {
                "error": f"Generation error: {str(e)}",
                "raw_response": ""
            }
        except Exception as e:
            component = {
                "error": f"Failed to parse generation response: {str(e)}",
                "raw_response": response.text if 'response' in locals() else ""
            }

        return component

    def generate_stream(self, spec: Dict[str, Any], options: Dict[str, Any]) -> Iterator[str]:
        """
        Generate a new component based on the provided specification with streaming output.

        Args:
            spec: Component specification.
            options: Generation options.

        Returns:
            An iterator that yields chunks of the generated component.
        """
        # Build the generation prompt
        prompt = self.prompt_builder.build_generation_prompt(spec, options)
        system_instruction = self.prompt_builder.get_system_instruction("generation")

        # Generate the component with streaming
        try:
            for chunk in self.client.models.generate_content_stream(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=4096,
                    system_instruction=system_instruction,
                    safety_settings=[
                        types.SafetySetting(
                            category="HARM_CATEGORY_HATE_SPEECH",
                            threshold="BLOCK_ONLY_HIGH"
                        ),
                        types.SafetySetting(
                            category="HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold="BLOCK_ONLY_HIGH"
                        )
                    ]
                )
            ):
                yield chunk.text
        except Exception as e:
            yield f"Error generating component: {str(e)}"

    async def generate_async(self, spec: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a new component asynchronously based on the provided specification.

        Args:
            spec: Component specification.
            options: Generation options.

        Returns:
            A dictionary containing the generated component.
        """
        # Build the generation prompt
        prompt = self.prompt_builder.build_generation_prompt(spec, options)
        system_instruction = self.prompt_builder.get_system_instruction("generation")

        # Generate the component asynchronously with improved configuration
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=4096,
                    system_instruction=system_instruction,
                    safety_settings=[
                        types.SafetySetting(
                            category="HARM_CATEGORY_HATE_SPEECH",
                            threshold="BLOCK_ONLY_HIGH"
                        ),
                        types.SafetySetting(
                            category="HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold="BLOCK_ONLY_HIGH"
                        )
                    ]
                )
            )

            # Parse the response
            component = self._parse_generation_response(response.text, spec)

        except types.BlockedPromptException as e:
            component = {
                "error": f"Generation blocked due to safety concerns: {str(e)}",
                "raw_response": ""
            }
        except types.GenerationException as e:
            component = {
                "error": f"Generation error: {str(e)}",
                "raw_response": ""
            }
        except Exception as e:
            component = {
                "error": f"Failed to parse generation response: {str(e)}",
                "raw_response": response.text if 'response' in locals() else ""
            }

        return component

    def _parse_generation_response(self, response_text: str, spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the generation response from the model.

        Args:
            response_text: The response text from the model.
            spec: The component specification.

        Returns:
            A dictionary containing the parsed component.
        """
        # This is a simplified implementation
        # In a real implementation, we would parse the response
        # and extract the component code

        # For now, we'll just return the response text as the component code
        return {
            "name": spec.get("name", "UnknownComponent"),
            "code": response_text,
            "filePath": f"{spec.get('name', 'unknown-component')}.tsx",
            "additionalFiles": []
        }
