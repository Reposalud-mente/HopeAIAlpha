"""
Component Analysis Module

This module contains the ComponentAnalyzer class that provides functionality
for analyzing React components.
"""

from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types

from ..utils.prompt_builder import PromptBuilder


class ComponentAnalyzer:
    """
    Component analyzer class for analyzing React components.

    This class provides methods for analyzing React components to identify
    their structure, props, state, hooks, dependencies, and potential issues.
    """

    def __init__(self, model_name: str, client: Optional[genai.Client] = None):
        """
        Initialize the component analyzer.

        Args:
            model_name: The name of the model to use for analysis.
            client: The Google GenAI client to use. If not provided, a new client will be created.
        """
        self.model_name = model_name
        self.prompt_builder = PromptBuilder()
        self.client = client

    def analyze(self, component_code: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a component and return information about it.

        Args:
            component_code: The component code to analyze.
            options: Analysis options.

        Returns:
            A dictionary containing the analysis results.
        """
        # Build the analysis prompt
        prompt = self.prompt_builder.build_analysis_prompt(component_code, options)
        system_instruction = self.prompt_builder.get_system_instruction("analysis")

        # Generate the analysis with improved configuration
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,  # Lower temperature for more focused analysis
                    max_output_tokens=2048,  # Allow for detailed analysis
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
            analysis = self._parse_analysis_response(response.text)

        except types.BlockedPromptException as e:
            analysis = {
                "error": f"Analysis blocked due to safety concerns: {str(e)}",
                "raw_response": ""
            }
        except types.GenerationException as e:
            analysis = {
                "error": f"Generation error: {str(e)}",
                "raw_response": ""
            }
        except Exception as e:
            analysis = {
                "error": f"Failed to parse analysis response: {str(e)}",
                "raw_response": response.text if 'response' in locals() else ""
            }

        # Add the original code to the analysis
        analysis["code"] = component_code

        return analysis

    async def analyze_async(self, component_code: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a component asynchronously and return information about it.

        Args:
            component_code: The component code to analyze.
            options: Analysis options.

        Returns:
            A dictionary containing the analysis results.
        """
        # Build the analysis prompt
        prompt = self.prompt_builder.build_analysis_prompt(component_code, options)
        system_instruction = self.prompt_builder.get_system_instruction("analysis")

        # Generate the analysis asynchronously with improved configuration
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,  # Lower temperature for more focused analysis
                    max_output_tokens=2048,  # Allow for detailed analysis
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
            analysis = self._parse_analysis_response(response.text)

        except types.BlockedPromptException as e:
            analysis = {
                "error": f"Analysis blocked due to safety concerns: {str(e)}",
                "raw_response": ""
            }
        except types.GenerationException as e:
            analysis = {
                "error": f"Generation error: {str(e)}",
                "raw_response": ""
            }
        except Exception as e:
            analysis = {
                "error": f"Failed to parse analysis response: {str(e)}",
                "raw_response": response.text if 'response' in locals() else ""
            }

        # Add the original code to the analysis
        analysis["code"] = component_code

        return analysis

    def _parse_analysis_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse the analysis response from the model.

        Args:
            response_text: The response text from the model.

        Returns:
            A dictionary containing the parsed analysis.
        """
        # This is a simplified implementation
        # In a real implementation, we would parse the JSON response
        # and extract the relevant information

        # For now, we'll just return a basic structure
        return {
            "name": "Unknown",
            "type": "unknown",
            "props": [],
            "state": [],
            "hooks": [],
            "dependencies": [],
            "issues": [],
            "suggestions": [],
            "raw_response": response_text
        }
