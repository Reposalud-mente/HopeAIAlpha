# AI Report Generator

This module provides an AI agent for generating comprehensive psychological reports based on patient assessments, evaluation areas, and diagnostic criteria.

## Overview

The AI Report Generator integrates with the PostgreSQL database to access patient data, assessment information, evaluation areas, and diagnostic criteria (both ICD-11 and DSM-5). It follows the six-step workflow defined in the application:

1. Patient Selection
2. Clinical Information
3. Consultation Reasons
4. Evaluation Areas
5. ICD-11/DSM-5 Criteria
6. Report Generation

## Components

### Database Validation

The `database-validation.ts` file contains functions to validate that all required data is available in the database before generating a report. It checks for:

- Patient information
- Clinician information
- Clinic information
- Consultation reasons
- Evaluation areas
- ICD-11 criteria
- DSM-5 criteria (if available)
- Primary diagnosis

### AI Report Agent

The `ai-report-agent.ts` file contains the main AI agent class that generates psychological reports. It:

1. Validates that all required data is available
2. Extracts the necessary data from the assessment
3. Generates the report content using the assessment data
4. Saves the report to the database

### DSM-5 Criteria Service

The `dsm5-criteria-service.ts` file provides a service to handle DSM-5 criteria. It maps ICD-11 codes to DSM-5 equivalents and provides functions to retrieve DSM-5 criteria for an assessment.

## Usage

To use the AI Report Generator in your application:

```typescript
import { AIReportAgent, ReportGenerationRequest } from '@/lib/ai-report-generator/ai-report-agent';

// Create a report generation request
const request: ReportGenerationRequest = {
  assessmentId: 'assessment-id',
  userId: 'user-id',
  language: 'es',
  includeRecommendations: true,
  includeTreatmentPlan: true,
  reportStyle: 'clinical'
};

// Initialize the AI report agent
const aiReportAgent = new AIReportAgent();

// Generate the report
const result = await aiReportAgent.generateReport(request);

if (result.success) {
  console.log(`Report generated successfully: ${result.reportId}`);
  console.log(result.reportText);
} else {
  console.error(`Failed to generate report: ${result.error}`);
}
```

## Database Schema

The AI Report Generator uses the following database models:

- `Assessment`: Contains the assessment information
- `Patient`: Contains the patient information
- `User`: Contains the clinician information
- `Clinic`: Contains the clinic information
- `ConsultationReason`: Contains the consultation reasons
- `EvaluationArea`: Contains the evaluation areas
- `ICDCriteria`: Contains the ICD-11 diagnostic criteria
- `DSM5Criteria`: Contains the DSM-5 diagnostic criteria
- `Report`: Contains the generated reports

## API Endpoints

The AI Report Generator exposes the following API endpoints:

- `POST /api/reports/generate`: Generates a new report
- `GET /api/reports/:id`: Retrieves a report by ID
- `PUT /api/reports/:id`: Updates a report
- `GET /api/assessments/:id/reports`: Lists all reports for an assessment
- `POST /api/assessments/:id/reports`: Creates a new report for an assessment

## React Integration

The `useAIReportGeneration` hook provides a convenient way to integrate the AI Report Generator into React components. It handles the API calls, loading states, and error handling.

```typescript
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';

function ReportGeneratorComponent() {
  const {
    generateReport,
    isGenerating,
    progress,
    currentPhase,
    result
  } = useAIReportGeneration();

  const handleGenerateReport = async () => {
    const result = await generateReport('assessment-id', {
      includeRecommendations: true,
      includeTreatmentPlan: true,
      reportStyle: 'clinical'
    });

    if (result.reportText) {
      // Handle successful report generation
    } else if (result.error) {
      // Handle error
    }
  };

  return (
    <div>
      <button onClick={handleGenerateReport} disabled={isGenerating}>
        Generate Report
      </button>
      
      {isGenerating && (
        <div>
          <p>{currentPhase}</p>
          <progress value={progress} max={100} />
        </div>
      )}
      
      {result && !result.error && (
        <div>
          <h2>Report Generated</h2>
          <pre>{result.reportText}</pre>
        </div>
      )}
      
      {result?.error && (
        <div>
          <h2>Error</h2>
          <p>{result.error}</p>
        </div>
      )}
    </div>
  );
}
```
