# RAG Report Demo

This is a demonstration of the RAG-based Clinical Report Generator. It provides a simple interface for generating clinical reports using the Retrieval-Augmented Generation (RAG) workflow.

## Features

- Interactive form for entering patient and assessment data
- Real-time report generation using the RAG workflow
- Progress tracking during report generation
- Server-side demo showing how to use the RAG workflow in server components

## How It Works

1. **User Input**: The user enters patient and assessment data in the form.
2. **RAG Workflow**: The data is sent to the RAG workflow, which:
   - Retrieves relevant DSM-5 content
   - Augments the prompt with the retrieved content
   - Generates the report using the Gemini model
3. **Output**: The generated report is displayed to the user

## Implementation Details

- Uses the `useRagReportGeneration` hook for client-side report generation
- Demonstrates server-side report generation using Server Actions
- Shows progress and current phase during report generation

## Requirements

- Gemini API key
- Google Drive API key
- DSM-5 content in a Google Drive folder

## Usage

1. Navigate to `/rag-report-demo`
2. Fill in the form with patient and assessment data
3. Click "Generate Report"
4. View the generated report in the "Informe Generado" tab

## Server-Side Demo

The server-side demo at `/rag-report-demo/server-demo` shows how to use the RAG workflow in server components. This is useful for generating reports in response to form submissions or other server-side events.

## Dependencies

- `@google/genai`: Google's Generative AI SDK
- `@langchain/langgraph`: LangChain's graph-based workflow orchestration
- `@langchain/core`: LangChain's core abstractions
- `axios`: HTTP client for making requests
- `pdf-parse`: Library for parsing PDF files (server-side only)
