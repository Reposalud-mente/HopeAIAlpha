/**
 * DSM-5 retrieval implementation for the RAG workflow
 * This is a server-side component and should only be used in server contexts
 */
import axios from 'axios';
import { BaseKnowledgeBase } from './knowledge-base';
import { DSM5RetrievalResult, KnowledgeBaseRetrievalOptions, RAGError } from '../types';
import { DEFAULT_CONFIG } from '../config';

// Server-side only imports - we'll check if we're in a server context before using this
// This is a workaround for Next.js, which runs some code in both client and server contexts
let pdfParse: any = null;

// Check if we're in a server-side context
const isServer = typeof window === 'undefined';

// Try to load pdf-parse in server context immediately
if (isServer) {
  try {
    // Import the createRequire function from the module package
    const { createRequire } = require('module');

    // Create a require function
    const customRequire = createRequire(import.meta.url);

    // Use the custom require to load pdf-parse
    pdfParse = customRequire('pdf-parse');
    console.log('Successfully loaded pdf-parse module using createRequire');
  } catch (error) {
    console.error('Failed to load pdf-parse module during initialization:', error);

    try {
      // Fallback to regular require
      pdfParse = require('pdf-parse');
      console.log('Successfully loaded pdf-parse module using regular require');
    } catch (requireError) {
      console.error('Failed to load pdf-parse using regular require:', requireError);
      // Don't set pdfParse - we'll try again later
    }
  }
}

/**
 * DSM-5 retriever that fetches content from a Google Drive folder
 */
export class DSM5Retriever extends BaseKnowledgeBase {
  private folderId: string;
  private apiKey: string;

  /**
   * Constructor
   * @param folderId Google Drive folder ID containing DSM-5 files
   * @param apiKey Google Drive API key
   */
  constructor(folderId: string, apiKey: string) {
    super();
    this.folderId = folderId;
    this.apiKey = apiKey;

    if (!this.folderId) {
      throw new RAGError('Google Drive folder ID is required for DSM5Retriever', 'configuration');
    }

    if (!this.apiKey) {
      throw new RAGError('Google Drive API key is required for DSM5Retriever', 'configuration');
    }
  }

  /**
   * Retrieves relevant DSM-5 content from the Google Drive folder
   * @param query The search query (e.g., disorder name, code, or keyword)
   * @param options Options for retrieval
   * @returns Promise resolving to an array of DSM-5 retrieval results
   */
  async retrieve(
    query: string,
    options: KnowledgeBaseRetrievalOptions = {}
  ): Promise<DSM5RetrievalResult[]> {
    try {
      // Check if we're in a server-side context
      if (!isServer) {
        console.warn('DSM-5 retrieval is only available in server-side contexts.');
        return [{
          content: 'DSM-5 retrieval is only available in server-side contexts. Using AI knowledge without DSM-5 context.',
          source: 'System Message',
          relevanceScore: 1.0
        }];
      }

      // Check if we're in a server-side context
      if (!isServer) {
        console.warn('Attempted to use pdf-parse in browser context. This is not supported.');
        return [{
          content: 'DSM-5 retrieval is only available in server-side contexts. Using AI knowledge without DSM-5 context.',
          source: 'System Message',
          relevanceScore: 1.0
        }];
      }

      // Try to load pdf-parse if not already loaded
      if (!pdfParse) {
        try {
          // Import the createRequire function from the module package
          const { createRequire } = require('module');

          // Create a require function
          const customRequire = createRequire(import.meta.url);

          // Use the custom require to load pdf-parse
          pdfParse = customRequire('pdf-parse');
          console.log('Successfully loaded pdf-parse module using createRequire in retrieve method');
        } catch (error) {
          console.error('Failed to load pdf-parse using createRequire:', error);

          try {
            // Fallback to regular require
            pdfParse = require('pdf-parse');
            console.log('Successfully loaded pdf-parse module using regular require in retrieve method');
          } catch (requireError) {
            console.error('Failed to load pdf-parse using regular require:', requireError);
            console.warn('Failed to load pdf-parse module. Using fallback mode without DSM-5 retrieval.');
            // Return a default message instead of throwing an error
            return [{
              content: 'DSM-5 retrieval is not available in this context. Using AI knowledge without DSM-5 context.',
              source: 'System Message',
              relevanceScore: 1.0
            }];
          }
        }
      }

      // Set default options
      const maxResults = options.maxResults || DEFAULT_CONFIG.maxResults;
      const minRelevanceScore = options.minRelevanceScore || DEFAULT_CONFIG.minRelevanceScore;

      // List files in the public folder via Google Drive API
      const listUrl = `https://www.googleapis.com/drive/v3/files?q='${this.folderId}'+in+parents&key=${this.apiKey}&fields=files(id,name,mimeType)`;
      const listRes = await axios.get(listUrl);
      const files = listRes.data.files;

      // Log all files in the folder
      console.log(`Found ${files.length} files in Google Drive folder:`);
      files.forEach((file: any) => {
        console.log(`- ${file.name} (ID: ${file.id}, Type: ${file.mimeType})`);
      });

      // Always look for dsm5.pdf in the folder (case-insensitive)
      const pdfFile = files.find((f: any) =>
        f.name.toLowerCase() === 'dsm5.pdf' ||
        f.name.toLowerCase().includes('dsm') ||
        f.name.toLowerCase().includes('manual')
      );

      if (!pdfFile) {
        console.warn('No DSM-5 PDF file found in the specified folder');
        return [{
          content: 'No se encontró ningún archivo DSM-5 en la carpeta especificada.',
          source: 'Error de búsqueda',
          relevanceScore: 0
        }];
      }

      // Log the selected PDF file
      console.log(`Using DSM-5 PDF file: ${pdfFile.name} (ID: ${pdfFile.id})`);


      // Download the PDF file
      console.log(`Downloading PDF file from Google Drive: ${pdfFile.name}`);
      const pdfUrl = `https://www.googleapis.com/drive/v3/files/${pdfFile.id}?alt=media&key=${this.apiKey}`;
      const pdfRes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
      const pdfBuffer = pdfRes.data;
      console.log(`Successfully downloaded PDF file (${pdfBuffer.byteLength} bytes)`);

      // Extract text from the PDF
      console.log('Parsing PDF content...');
      const data = await pdfParse(pdfBuffer);
      const pdfText = data.text;
      console.log(`Successfully extracted ${pdfText.length} characters of text from the PDF`);
      console.log(`PDF Info:`, data.info);
      console.log(`First 100 characters: ${pdfText.substring(0, 100)}...`);

      // Split the PDF text into sections (approximately by pages or sections)
      const sections = this.splitIntoSections(pdfText);

      // Score each section based on relevance to the query
      const scoredSections = sections.map(section => {
        const score = this.calculateRelevanceScore(section, query);
        return { section, score };
      });

      // Sort by relevance score and take the top results
      const topSections = scoredSections
        .sort((a, b) => b.score - a.score)
        .filter(item => item.score >= minRelevanceScore)
        .slice(0, maxResults);

      // If no relevant sections found, return a default message
      if (topSections.length === 0) {
        return [{
          content: `No se encontró contenido relevante para la consulta: "${query}"`,
          source: `DSM-5 (${pdfFile.name})`,
          relevanceScore: 0
        }];
      }

      // Convert to DSM5RetrievalResult format with more detailed source information
      return topSections.map(({ section, score }) => ({
        content: section,
        source: `DSM-5 (${pdfFile.name}, ID: ${pdfFile.id})`,
        relevanceScore: score,
        fileDetails: {
          fileName: pdfFile.name,
          fileId: pdfFile.id,
          mimeType: pdfFile.mimeType
        }
      }));
    } catch (error) {
      console.error('Error retrieving DSM-5 content:', error);
      throw new RAGError(
        `Failed to retrieve DSM-5 content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'retrieval'
      );
    }
  }

  /**
   * Splits the PDF text into sections
   * @param text The PDF text
   * @returns Array of text sections
   */
  private splitIntoSections(text: string): string[] {
    // Split by double newlines and merge small sections
    const rawSections = text.split('\n\n');
    const sections: string[] = [];
    let currentSection = '';
    let inCriteriaSection = false;

    for (const rawSection of rawSections) {
      // Check if this section contains diagnostic criteria
      const isCriteriaSection =
        rawSection.toLowerCase().includes('criterios diagnósticos') ||
        rawSection.toLowerCase().includes('criterio ') ||
        (rawSection.match(/[A-Z]\. /i) && rawSection.length < 200) ||
        (rawSection.match(/\d\. /i) && rawSection.length < 200 && currentSection.toLowerCase().includes('criterio'));

      // If we're entering a criteria section or continuing one
      if (isCriteriaSection) {
        inCriteriaSection = true;
      }

      // Add the current raw section to our accumulating section
      currentSection += rawSection + '\n\n';

      // Determine if we should create a new section
      const shouldCreateSection =
        // Regular size-based sectioning
        (currentSection.length >= 500 && !inCriteriaSection) ||
        // Special handling for criteria sections - keep them together but don't let them get too large
        (currentSection.length >= 2000 && inCriteriaSection) ||
        // End of a criteria section
        (inCriteriaSection &&
         !isCriteriaSection &&
         !rawSection.match(/^\d\./) &&
         !rawSection.match(/^[a-z]\)/i) &&
         currentSection.length > 300);

      if (shouldCreateSection) {
        sections.push(currentSection.trim());
        currentSection = '';
        inCriteriaSection = false;
      }
    }

    // Add the last section if it's not empty
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }

    // Special post-processing to identify and extract complete criteria sections
    const processedSections = [];
    for (const section of sections) {
      if (section.toLowerCase().includes('criterios diagnósticos')) {
        // Try to extract just the criteria part if it's mixed with other content
        const criteriaMatch = section.match(/criterios diagnósticos[\s\S]*?(?=\n\n\w|$)/i);
        if (criteriaMatch && criteriaMatch[0].length > 100) {
          processedSections.push(criteriaMatch[0]);
          // Also keep the original section
          processedSections.push(section);
          continue;
        }
      }
      processedSections.push(section);
    }

    return processedSections;
  }

  /**
   * Calculates the relevance score of a section for a query
   * @param section The text section
   * @param query The search query
   * @returns Relevance score between 0 and 1
   */
  private calculateRelevanceScore(section: string, query: string): number {
    const sectionLower = section.toLowerCase();
    const queryLower = query.toLowerCase();

    // Split the query into words
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 3);

    // Calculate the score based on word occurrences
    let score = 0;

    // Exact phrase match has high weight
    if (sectionLower.includes(queryLower)) {
      score += 0.6;
    }

    // Individual word matches
    for (const word of queryWords) {
      if (sectionLower.includes(word)) {
        // Add score based on word frequency
        const regex = new RegExp(word, 'gi');
        const matches = sectionLower.match(regex);
        if (matches) {
          score += 0.1 * Math.min(matches.length, 5) / queryWords.length;
        }
      }
    }

    // Bonus for sections that contain diagnostic codes (if the query looks like a code)
    const codeRegex = /[A-Z]?\d+(\.\d+)?/;
    if (codeRegex.test(queryLower) && codeRegex.test(sectionLower)) {
      score += 0.2;
    }

    // Significant bonus for sections containing diagnostic criteria
    if (sectionLower.includes('criterios diagnósticos') ||
        sectionLower.includes('criterio ') ||
        sectionLower.includes('criterios ') ||
        (sectionLower.includes('criterio') && sectionLower.match(/[a-z]\d+/i)) ||
        (sectionLower.includes('criterio') && sectionLower.match(/[a-z]\.\d+/i))) {
      score += 0.3;
    }

    // Extra bonus for sections with lettered criteria (A, B, C, etc.)
    if (sectionLower.match(/criterio [a-z]:/i) ||
        sectionLower.match(/criterio [a-z]\./i) ||
        sectionLower.match(/[a-z]\. /i) && sectionLower.includes('criterio')) {
      score += 0.2;
    }

    // Bonus for sections with numbered subcriteria (1, 2, 3, etc.)
    if (sectionLower.match(/\d\. /i) &&
        (sectionLower.includes('criterio') || sectionLower.includes('diagnóstico'))) {
      score += 0.1;
    }

    // Cap the score at 1.0
    return Math.min(score, 1.0);
  }
}
