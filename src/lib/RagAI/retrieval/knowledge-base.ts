/**
 * Knowledge base interface and implementations for the RAG workflow
 */
import { DSM5RetrievalResult, KnowledgeBaseRetrievalOptions } from '../types';

/**
 * Interface for a knowledge base
 */
export interface KnowledgeBase {
  /**
   * Retrieves relevant content from the knowledge base
   * @param query The search query
   * @param options Options for retrieval
   * @returns Promise resolving to an array of retrieval results
   */
  retrieve(query: string, options?: KnowledgeBaseRetrievalOptions): Promise<DSM5RetrievalResult[]>;
}

/**
 * Abstract base class for knowledge bases
 */
export abstract class BaseKnowledgeBase implements KnowledgeBase {
  /**
   * Retrieves relevant content from the knowledge base
   * @param query The search query
   * @param options Options for retrieval
   * @returns Promise resolving to an array of retrieval results
   */
  abstract retrieve(query: string, options?: KnowledgeBaseRetrievalOptions): Promise<DSM5RetrievalResult[]>;
  
  /**
   * Formats the retrieval results for inclusion in the prompt
   * @param results The retrieval results
   * @returns Formatted retrieval results as a string
   */
  formatRetrievalResults(results: DSM5RetrievalResult[]): string {
    if (results.length === 0) {
      return 'No se encontró información relevante en la base de conocimientos.';
    }
    
    return results.map((result, index) => {
      return `
FUENTE ${index + 1}: ${result.source}
${'-'.repeat(80)}
${result.content}
${'-'.repeat(80)}
`;
    }).join('\n');
  }
}
