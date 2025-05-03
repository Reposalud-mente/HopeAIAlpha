/**
 * LangChain state graph for the RAG workflow
 */
import { StateGraph, Annotation } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import { DSM5RetrievalResult, RAGError, WizardReportData } from '../types';

/**
 * State definition for the RAG workflow
 */
const RagStateAnnotation = Annotation.Root({
  // Input data
  wizardData: Annotation<WizardReportData>(),
  
  // Retrieval state
  query: Annotation<string>(),
  retrievalResults: Annotation<DSM5RetrievalResult[]>({
    default: () => [],
  }),
  
  // Generation state
  prompt: Annotation<string>(),
  reportText: Annotation<string>(),
  
  // Metadata
  metadata: Annotation<Record<string, any>>({
    default: () => ({}),
  }),
  
  // Error handling
  error: Annotation<string | null>({
    default: () => null,
  }),
});

/**
 * Type for the RAG workflow state
 */
export type RagState = typeof RagStateAnnotation.State;

/**
 * Creates a state graph for the RAG workflow
 * @returns The state graph
 */
export function createRagStateGraph() {
  // Create the state graph
  const graph = new StateGraph(RagStateAnnotation);
  
  // Add nodes to the graph
  
  // 1. Prepare Query Node
  // This node prepares the query for retrieval based on the wizard data
  graph.addNode('prepareQuery', async (state: RagState) => {
    try {
      const { wizardData } = state;
      
      // Extract relevant information for the query
      const diagnosisPart = wizardData.icdCriteria?.join(' ') || '';
      const reasonsPart = wizardData.consultationReasons?.join(' ') || '';
      const areasPart = wizardData.evaluationAreas?.join(' ') || '';
      
      // Combine into a query
      const query = `${diagnosisPart} ${reasonsPart} ${areasPart}`.trim();
      
      // If the query is empty, use a default query
      const finalQuery = query || 'evaluación psicológica general';
      
      return {
        query: finalQuery,
        metadata: {
          ...state.metadata,
          queryGenerationTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error in prepareQuery node:', error);
      return {
        error: `Error preparing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
  
  // 2. Retrieve Context Node
  // This node retrieves relevant context from the knowledge base
  graph.addNode('retrieveContext', async (state: RagState) => {
    try {
      // This is a placeholder - the actual implementation will be in the ClinicalReportAgent
      // The agent will inject the retrieval results into the state
      return {
        metadata: {
          ...state.metadata,
          retrievalTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error in retrieveContext node:', error);
      return {
        error: `Error retrieving context: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
  
  // 3. Prepare Prompt Node
  // This node prepares the prompt for the LLM based on the wizard data and retrieval results
  graph.addNode('preparePrompt', async (state: RagState) => {
    try {
      // This is a placeholder - the actual implementation will be in the ClinicalReportAgent
      // The agent will inject the prompt into the state
      return {
        metadata: {
          ...state.metadata,
          promptGenerationTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error in preparePrompt node:', error);
      return {
        error: `Error preparing prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
  
  // 4. Generate Report Node
  // This node generates the report using the LLM
  graph.addNode('generateReport', async (state: RagState) => {
    try {
      // This is a placeholder - the actual implementation will be in the ClinicalReportAgent
      // The agent will inject the report text into the state
      return {
        metadata: {
          ...state.metadata,
          reportGenerationTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error in generateReport node:', error);
      return {
        error: `Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
  
  // 5. Error Handler Node
  // This node handles errors in the workflow
  graph.addNode('handleError', async (state: RagState) => {
    console.error('Error in RAG workflow:', state.error);
    
    // Return a default error message if the report generation fails
    return {
      reportText: `Error generando el informe: ${state.error}`,
      metadata: {
        ...state.metadata,
        errorHandlingTime: new Date().toISOString(),
      },
    };
  });
  
  // Add edges to the graph
  
  // Normal flow
  graph.addEdge('__start__', 'prepareQuery');
  graph.addEdge('prepareQuery', 'retrieveContext');
  graph.addEdge('retrieveContext', 'preparePrompt');
  graph.addEdge('preparePrompt', 'generateReport');
  graph.addEdge('generateReport', '__end__');
  
  // Error handling
  graph.addConditionalEdges(
    'prepareQuery',
    (state) => state.error ? 'handleError' : 'retrieveContext'
  );
  
  graph.addConditionalEdges(
    'retrieveContext',
    (state) => state.error ? 'handleError' : 'preparePrompt'
  );
  
  graph.addConditionalEdges(
    'preparePrompt',
    (state) => state.error ? 'handleError' : 'generateReport'
  );
  
  graph.addConditionalEdges(
    'generateReport',
    (state) => state.error ? 'handleError' : '__end__'
  );
  
  graph.addEdge('handleError', '__end__');
  
  // Compile the graph
  return graph.compile({
    checkpointer: new MemorySaver(),
  });
}
