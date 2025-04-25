"""
Component Modification Module

This module contains the ComponentModifier class that provides functionality
for modifying React components.
"""

from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types

from ..utils.prompt_builder import PromptBuilder


class ComponentModifier:
    """
    Component modifier class for modifying React components.

    This class provides methods for modifying React components based on
    user specifications.
    """

    def __init__(self, model_name: str, client: Optional[genai.Client] = None):
        """
        Initialize the component modifier.

        Args:
            model_name: The name of the model to use for modification.
            client: The Google GenAI client to use. If not provided, a new client will be created.
        """
        self.model_name = model_name
        self.prompt_builder = PromptBuilder()
        self.client = client

    def modify(
        self,
        component_code: str,
        modifications: Dict[str, Any],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Modify an existing component based on the provided modifications.

        Args:
            component_code: The component code to modify.
            modifications: Modifications to apply.
            options: Modification options.

        Returns:
            A dictionary containing the modified component.
        """
        # Build the modification prompt
        prompt = self.prompt_builder.build_modification_prompt(
            component_code,
            modifications,
            options
        )
        system_instruction = self.prompt_builder.get_system_instruction("modification")

        # Generate the modified component with improved configuration
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,  # Balanced temperature for modifications
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
            modified_component = self._parse_modification_response(
                response.text,
                component_code,
                modifications
            )

        except types.BlockedPromptException as e:
            modified_component = {
                "error": f"Modification blocked due to safety concerns: {str(e)}",
                "raw_response": ""
            }
        except types.GenerationException as e:
            modified_component = {
                "error": f"Generation error: {str(e)}",
                "raw_response": ""
            }
        except Exception as e:
            modified_component = {
                "error": f"Failed to parse modification response: {str(e)}",
                "raw_response": response.text if 'response' in locals() else ""
            }

        return modified_component

    async def modify_async(
        self,
        component_code: str,
        modifications: Dict[str, Any],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Modify an existing component asynchronously based on the provided modifications.

        Args:
            component_code: The component code to modify.
            modifications: Modifications to apply.
            options: Modification options.

        Returns:
            A dictionary containing the modified component.
        """
        # Build the modification prompt
        prompt = self.prompt_builder.build_modification_prompt(
            component_code,
            modifications,
            options
        )
        system_instruction = self.prompt_builder.get_system_instruction("modification")

        # Generate the modified component asynchronously with improved configuration
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,
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
            modified_component = self._parse_modification_response(
                response.text,
                component_code,
                modifications
            )

        except types.BlockedPromptException as e:
            modified_component = {
                "error": f"Modification blocked due to safety concerns: {str(e)}",
                "raw_response": ""
            }
        except types.GenerationException as e:
            modified_component = {
                "error": f"Generation error: {str(e)}",
                "raw_response": ""
            }
        except Exception as e:
            modified_component = {
                "error": f"Failed to parse modification response: {str(e)}",
                "raw_response": response.text if 'response' in locals() else ""
            }

        return modified_component

    def _parse_modification_response(
        self,
        response_text: str,
        original_code: str,
        modifications: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Parse the modification response from the model.

        Args:
            response_text: The response text from the model.
            original_code: The original component code.
            modifications: The modifications that were applied.

        Returns:
            A dictionary containing the parsed modified component.
        """
        # This is a simplified implementation
        # In a real implementation, we would parse the response
        # and extract the modified component code

        # For now, we'll just return the response text as the modified component code
        return {
            "name": "ModifiedComponent",
            "code": response_text,
            "originalCode": original_code,
            "filePath": "modified-component.tsx",
            "appliedModifications": modifications.get("modifications", []),
            "failedModifications": []
        }
