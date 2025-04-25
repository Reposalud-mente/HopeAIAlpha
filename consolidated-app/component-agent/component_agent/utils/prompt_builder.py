"""
Prompt Builder Module

This module contains the PromptBuilder class that provides functionality
for building prompts for the generative model.
"""

from typing import Any, Dict, List, Optional, Tuple

from .system_prompts import (
    DEFAULT_SYSTEM_PROMPT,
    ANALYSIS_SPECIFIC_INSTRUCTION,
    GENERATION_SPECIFIC_INSTRUCTION,
    MODIFICATION_SPECIFIC_INSTRUCTION
)


class PromptBuilder:
    """
    Prompt builder class for building prompts for the generative model.

    This class provides methods for building prompts for analyzing,
    generating, and modifying React components.
    """

    def __init__(self, system_prompt: Optional[str] = None):
        """
        Initialize the prompt builder.

        Args:
            system_prompt: Custom system prompt to use. If not provided, the default prompt will be used.
        """
        self.system_prompt = system_prompt or DEFAULT_SYSTEM_PROMPT

    def get_system_instruction(self, operation_type: str) -> str:
        """
        Get a system instruction for a specific operation type.

        Args:
            operation_type: The type of operation (analysis, generation, modification).

        Returns:
            The system instruction for the operation type.
        """
        # Get operation-specific instruction
        operation_specific = {
            "analysis": ANALYSIS_SPECIFIC_INSTRUCTION,
            "generation": GENERATION_SPECIFIC_INSTRUCTION,
            "modification": MODIFICATION_SPECIFIC_INSTRUCTION
        }

        # Return the full system prompt for the operation
        return self.system_prompt

    def build_analysis_prompt(self, component_code: str, options: Dict[str, Any]) -> str:
        """
        Build a prompt for analyzing a component.

        Args:
            component_code: The component code to analyze.
            options: Analysis options.

        Returns:
            The analysis prompt.
        """
        # Build the analysis prompt
        prompt = f"""
        You are an expert React component analyzer. Your task is to analyze the following React component
        and provide detailed information about its structure, props, state, hooks, dependencies, and potential issues.

        Please analyze the component for the following aspects:
        - Component name and type (functional or class)
        - Props and their types
        - State and its usage
        - Hooks and their usage
        - Dependencies and imports
        - Potential issues and suggestions for improvement

        Component code:
        ```tsx
        {component_code}
        ```

        Please provide your analysis in a structured format that can be easily parsed.
        """

        # Add specific analysis options
        if options.get("accessibility", False):
            prompt += "\nPlease also analyze the component for accessibility issues and provide suggestions for improvement."

        if options.get("performance", False):
            prompt += "\nPlease also analyze the component for performance issues and provide suggestions for improvement."

        if options.get("bestPractices", False):
            prompt += "\nPlease also analyze the component for adherence to React best practices and provide suggestions for improvement."

        return prompt

    def build_generation_prompt(self, spec: Dict[str, Any], options: Dict[str, Any]) -> str:
        """
        Build a prompt for generating a component.

        Args:
            spec: Component specification.
            options: Generation options.

        Returns:
            The generation prompt.
        """
        # Extract component details from the spec
        name = spec.get("name", "UnknownComponent")
        description = spec.get("description", "")
        props = spec.get("props", [])
        state = spec.get("state", [])
        functionality = spec.get("functionality", "")
        styling = spec.get("styling", "")
        dependencies = spec.get("dependencies", [])
        examples = spec.get("examples", [])

        # Build the generation prompt
        prompt = f"""
        You are an expert React component generator. Your task is to generate a high-quality React component
        based on the following specification.

        Component Name: {name}
        Component Description: {description}
        """

        # Add props
        if props:
            prompt += "\nProps:"
            for prop in props:
                prop_name = prop.get("name", "")
                prop_type = prop.get("type", "")
                prop_required = "required" if prop.get("required", False) else "optional"
                prop_default = prop.get("defaultValue", "")
                prop_description = prop.get("description", "")

                prompt += f"\n- {prop_name}: {prop_type} ({prop_required})"
                if prop_default:
                    prompt += f", default: {prop_default}"
                if prop_description:
                    prompt += f" - {prop_description}"

        # Add state
        if state:
            prompt += "\nState:"
            for s in state:
                state_name = s.get("name", "")
                state_type = s.get("type", "")
                state_initial = s.get("initialValue", "")
                state_description = s.get("description", "")

                prompt += f"\n- {state_name}: {state_type}"
                if state_initial:
                    prompt += f", initial: {state_initial}"
                if state_description:
                    prompt += f" - {state_description}"

        # Add functionality
        if functionality:
            prompt += f"\nFunctionality:\n{functionality}"

        # Add styling
        if styling:
            prompt += f"\nStyling:\n{styling}"

        # Add dependencies
        if dependencies:
            prompt += "\nDependencies:"
            for dependency in dependencies:
                prompt += f"\n- {dependency}"

        # Add examples
        if examples:
            prompt += "\nExamples:"
            for example in examples:
                prompt += f"\n```tsx\n{example}\n```"

        # Add generation options
        prompt += "\nGeneration Options:"
        prompt += f"\n- Component Style: {options.get('style', 'functional')}"
        prompt += f"\n- TypeScript: {options.get('typescript', True)}"
        prompt += f"\n- JSDoc Comments: {options.get('jsdoc', True)}"
        prompt += f"\n- Use shadcn/ui: {options.get('shadcn', True)}"
        prompt += f"\n- Use Tailwind CSS: {options.get('tailwind', True)}"

        # Add final instructions
        prompt += """

        Please generate a high-quality React component based on the above specification.
        The component should follow React best practices, be well-documented, and be easy to use and maintain.

        Please provide only the component code without any additional explanation.
        """

        return prompt

    def build_modification_prompt(
        self,
        component_code: str,
        modifications: Dict[str, Any],
        options: Dict[str, Any]
    ) -> str:
        """
        Build a prompt for modifying a component.

        Args:
            component_code: The component code to modify.
            modifications: Modifications to apply.
            options: Modification options.

        Returns:
            The modification prompt.
        """
        # Extract modifications
        mods = modifications.get("modifications", [])
        description = modifications.get("description", "")

        # Build the modification prompt
        prompt = f"""
        You are an expert React component modifier. Your task is to modify the following React component
        based on the specified modifications.

        Original Component:
        ```tsx
        {component_code}
        ```

        Modifications to Apply:
        {description}
        """

        # Add specific modifications
        for i, mod in enumerate(mods):
            mod_type = mod.get("type", "")
            mod_target = mod.get("target", "")
            mod_value = mod.get("value", "")

            prompt += f"\nModification {i+1}:"
            prompt += f"\n- Type: {mod_type}"
            prompt += f"\n- Target: {mod_target}"
            if mod_value:
                prompt += f"\n- Value: {mod_value}"

        # Add modification options
        prompt += "\nModification Options:"
        prompt += f"\n- Use QuickEdit: {options.get('useQuickEdit', False)}"

        # Add final instructions
        prompt += """

        Please modify the component according to the specified modifications.
        The modified component should maintain the same code quality and style as the original component.

        Please provide only the modified component code without any additional explanation.
        """

        return prompt
