# RAG-based Clinical Report Generator

This module provides a Retrieval-Augmented Generation (RAG) workflow for generating clinical psychological reports based on structured input from a clinical wizard UI.

## Architecture

The RAG workflow consists of three main components:

1. **Retrieval Layer**: Fetches relevant clinical context from authoritative sources like DSM-5.
2. **Augmentation**: Injects the retrieved context into the prompt for the LLM.
3. **Generation Layer**: Uses the Gemini-2.5-flash-preview-04-17 model to generate the final clinical report.

## Folder Structure

```
src/lib/RagAI/
├── index.ts                     # Main export file
├── types.ts                     # Type definitions
├── config.ts                    # Configuration and environment variables
├── retrieval/
│   ├── dsm5-retriever.ts        # DSM-5 retrieval implementation
│   ├── knowledge-base.ts        # Knowledge base interface and implementations
│   └── index.ts                 # Exports for retrieval components
├── generation/
│   ├── gemini-client.ts         # Gemini API client
│   ├── prompt-templates.ts      # Clinical report prompt templates
│   └── index.ts                 # Exports for generation components
├── rag-workflow/
│   ├── clinical-report-agent.ts # Main RAG workflow implementation
│   ├── state-graph.ts           # LangChain state graph for orchestration
│   └── index.ts                 # Exports for workflow components
```

## Key Components

- `ClinicalReportAgent`: Main entry point for generating reports using the RAG workflow.
- `DSM5Retriever`: Retrieves relevant DSM-5 content from a Google Drive folder.
- `GeminiClient`: Client for interacting with the Gemini API.
- `StateGraph`: LangChain state graph for orchestrating the RAG workflow.

## Usage

### Basic Usage

```typescript
import { ClinicalReportAgent, WizardReportData } from '@/lib/RagAI';

// Create wizard data
const wizardData: WizardReportData = {
  patientId: 'patient-123',
  patientName: 'John Doe',
  clinicianName: 'Dr. Smith',
  clinicName: 'Example Clinic',
  assessmentDate: '2025-05-01',
  reportType: 'evaluacion-psicologica',
  // ... other fields
};

// Create the clinical report agent
const reportAgent = new ClinicalReportAgent({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  driveFolderId: process.env.NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID,
  driveApiKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY
});

// Generate the report
const result = await reportAgent.generateReport(wizardData, {
  includeRecommendations: true,
  includeTreatmentPlan: true,
  language: 'es'
});

console.log(result.reportText);
```

### Using the React Hook

```typescript
import { useRagReportGeneration } from '@/hooks/useRagReportGeneration';

function ReportGenerator() {
  const { generateReport, isGenerating, progress, currentPhase, result } = useRagReportGeneration();

  const handleGenerateReport = async () => {
    const wizardData = {
      patientId: 'patient-123',
      patientName: 'John Doe',
      // ... other fields
    };

    const result = await generateReport({
      wizardData,
      includeRecommendations: true,
      includeTreatmentPlan: true,
      language: 'es'
    });

    if (result.reportText) {
      // Handle the generated report
      console.log(result.reportText);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateReport} disabled={isGenerating}>
        Generate Report
      </button>

      {isGenerating && (
        <div>
          <p>Generating report: {currentPhase}</p>
          <progress value={progress} max={100} />
        </div>
      )}

      {result?.reportText && (
        <div>
          <h2>Generated Report</h2>
          <pre>{result.reportText}</pre>
        </div>
      )}
    </div>
  );
}
```

### API Route

```typescript
// src/app/api/rag-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ClinicalReportAgent } from '@/lib/RagAI';

export async function POST(req: NextRequest) {
  try {
    const { wizardData } = await req.json();

    const reportAgent = new ClinicalReportAgent({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      driveFolderId: process.env.NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID,
      driveApiKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY
    });

    const result = await reportAgent.generateReport(wizardData);

    return NextResponse.json({ reportText: result.reportText });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

## Configuration

The RAG workflow can be configured with the following options:

- `apiKey`: Gemini API key (required)
- `modelName`: Gemini model name (default: 'gemini-1.5-pro')
- `driveFolderId`: Google Drive folder ID containing DSM-5 files
- `driveApiKey`: Google Drive API key
- `temperature`: Temperature for text generation (default: 0.7)
- `maxTokens`: Maximum tokens for text generation (default: 4096)
- `topK`: Top-K for text generation (default: 3)
- `streamResponse`: Whether to stream the response (default: true)

## Error Handling

The RAG workflow uses a custom `RAGError` class for error handling. Errors are categorized by type:

- `retrieval`: Errors related to retrieving content from the knowledge base
- `generation`: Errors related to generating text with the LLM
- `workflow`: Errors related to the overall workflow
- `configuration`: Errors related to configuration

## Environment Variables

The RAG workflow requires the following environment variables:

- `NEXT_PUBLIC_GEMINI_API_KEY`: Gemini API key
- `NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID`: Google Drive folder ID containing DSM-5 files
- `NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY`: Google Drive API key

## Dependencies

- `@google/genai`: Google's Generative AI SDK for JavaScript
- `@langchain/langgraph`: LangChain's graph-based workflow orchestration
- `@langchain/core`: LangChain's core abstractions
- `axios`: HTTP client for making requests to the Google Drive API
- `pdf-parse`: Library for parsing PDF files (server-side only)
