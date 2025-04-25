"""
Test Connection to Google Gen AI API

This script tests the connection to the Google Gen AI API using the API key
from the .env file.
"""

import os
import sys
import traceback
from pathlib import Path

import dotenv
from google import genai

# Load environment variables from .env file
dotenv.load_dotenv()

def main():
    """Test the connection to the Google Gen AI API."""
    # Get the API key from the environment
    api_key = os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        print("Error: GOOGLE_API_KEY not found in environment variables.")
        print("Make sure you have created a .env file with your API key.")
        sys.exit(1)

    # Configure the Google Gen AI client
    try:
        # Create a client with the API key
        client = genai.Client(api_key=api_key)
        print("Successfully created the Google Gen AI client.")

        # Test the connection by generating content
        response = client.models.generate_content(
            model='gemini-1.5-pro-001',
            contents="Hello, world!"
        )

        print("\nSuccessfully connected to the Google Gen AI API!")
        print("\nTest response:")
        print(f"'{response.text}'")

    except Exception as e:
        print(f"Error connecting to the Google Gen AI API: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
