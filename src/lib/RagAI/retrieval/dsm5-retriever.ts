/**
 * DSM-5 retrieval implementation for the RAG workflow
 * This is a server-side component and should only be used in server contexts
 * Enhanced with vector embeddings for more accurate semantic search
 */
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { BaseKnowledgeBase } from './knowledge-base';
import { DSM5RetrievalResult, KnowledgeBaseRetrievalOptions, RAGError } from '../types';
import { DEFAULT_CONFIG } from '../config';
import { ENV } from '../config';

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
 * Interface for embedding cache to avoid redundant embedding calculations
 */
interface EmbeddingCache {
  [key: string]: number[];
}

/**
 * DSM-5 retriever that fetches content from a Google Drive folder
 * Enhanced with vector embeddings for more accurate semantic search
 */
export class DSM5Retriever extends BaseKnowledgeBase {
  private folderId: string;
  private driveApiKey: string;
  private genaiClient: GoogleGenAI | null = null;
  private embeddingCache: EmbeddingCache = {};
  private embeddingModel = 'gemini-embedding-exp-03-07';

  /**
   * Constructor
   * @param folderId Google Drive folder ID containing DSM-5 files
   * @param driveApiKey Google Drive API key
   * @param genaiApiKey Optional Gemini API key for embeddings (defaults to ENV.GEMINI_API_KEY)
   */
  constructor(folderId: string, driveApiKey: string, genaiApiKey?: string) {
    super();
    this.folderId = folderId;
    this.driveApiKey = driveApiKey;

    if (!this.folderId) {
      throw new RAGError('Google Drive folder ID is required for DSM5Retriever', 'configuration');
    }

    if (!this.driveApiKey) {
      throw new RAGError('Google Drive API key is required for DSM5Retriever', 'configuration');
    }

    // Initialize the Google GenAI client for embeddings if we're in a server context
    if (isServer) {
      try {
        const apiKey = genaiApiKey || ENV.GEMINI_API_KEY;
        if (!apiKey) {
          console.warn('No Gemini API key provided for embeddings. Falling back to keyword-based search.');
        } else {
          this.genaiClient = new GoogleGenAI({ apiKey });
          console.log('Successfully initialized Google GenAI client for embeddings');
        }
      } catch (error) {
        console.error('Failed to initialize Google GenAI client:', error);
        console.warn('Falling back to keyword-based search');
      }
    }
  }

  /**
   * Generates embeddings for text using the Gemini API
   * @param text The text to embed
   * @returns Promise resolving to the embedding vector
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check if we have a cached embedding for this text
    const cacheKey = text.trim().toLowerCase();
    if (this.embeddingCache[cacheKey]) {
      return this.embeddingCache[cacheKey];
    }

    // If no GenAI client is available, return an empty array
    if (!this.genaiClient) {
      return [];
    }

    try {
      console.log(`Generating embedding for text of length ${text.length} using model ${this.embeddingModel}`);

      // Truncate text if it's too long (Gemini has input limits)
      const maxTextLength = 8000;
      const truncatedText = text.length > maxTextLength ? text.substring(0, maxTextLength) : text;

      if (text.length > maxTextLength) {
        console.log(`Text truncated from ${text.length} to ${maxTextLength} characters for embedding`);
      }

      // Generate embeddings using the Gemini API
      // Call the embedContent method with the correct format
      const response = await this.genaiClient.models.embedContent({
        model: this.embeddingModel,
        contents: truncatedText,
        config: {
          taskType: "RETRIEVAL_DOCUMENT" // Optimized for document retrieval
        }
      });

      console.log('Embedding API response received');

      // Log the response structure for debugging
      if (response) {
        console.log('Response keys:', Object.keys(response));
        if (response.embeddings) {
          console.log('Embeddings keys:', Object.keys(response.embeddings));
          if (response.embeddings.values) {
            const valuesType = typeof response.embeddings.values;
            console.log(`Embeddings values type: ${valuesType}`);
            if (valuesType === 'object') {
              console.log(`Is array: ${Array.isArray(response.embeddings.values)}`);
              if (Array.isArray(response.embeddings.values)) {
                console.log(`Array length: ${response.embeddings.values.length}`);
              }
            }
          }
        }
      }

      // Cache the embedding
      if (response && response.embeddings) {
        try {
          // Convert the embeddings to a regular array of numbers
          // This handles different possible return types from the API
          const values = response.embeddings.values;
          let embeddingValues: number[] = [];

          // Handle different possible return types
          if (Array.isArray(values)) {
            embeddingValues = values as number[];
          } else if (values && typeof values === 'object') {
            // If it's an iterator or other object with values, try to convert it
            embeddingValues = Object.values(values).filter(v => typeof v === 'number') as number[];
          }

          if (embeddingValues.length > 0) {
            console.log(`Successfully generated embedding with ${embeddingValues.length} dimensions`);
            this.embeddingCache[cacheKey] = embeddingValues;
            return embeddingValues;
          } else {
            console.warn('Embedding values array is empty');
          }
        } catch (conversionError) {
          console.error('Error converting embeddings:', conversionError);
          if (conversionError instanceof Error) {
            console.error('Conversion error details:', conversionError.message);
            console.error('Stack trace:', conversionError.stack);
          }
        }
      } else {
        console.warn('Response or embeddings property is undefined');
      }

      console.warn('No embedding values returned from Gemini API');
      return [];
    } catch (error) {
      console.error('Error generating embeddings:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }

  /**
   * Calculates the cosine similarity between two vectors
   * @param vecA First vector
   * @param vecB Second vector
   * @returns Cosine similarity score between -1 and 1
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    // If either vector is empty, return 0
    if (vecA.length === 0 || vecB.length === 0) {
      return 0;
    }

    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }

    // Calculate magnitudes
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    // Calculate cosine similarity
    if (magA === 0 || magB === 0) {
      return 0;
    }
    return dotProduct / (magA * magB);
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
      const listUrl = `https://www.googleapis.com/drive/v3/files?q='${this.folderId}'+in+parents&key=${this.driveApiKey}&fields=files(id,name,mimeType)`;
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
      const pdfUrl = `https://www.googleapis.com/drive/v3/files/${pdfFile.id}?alt=media&key=${this.driveApiKey}`;
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

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Score each section based on relevance to the query
      const scoredSections = await Promise.all(sections.map(async section => {
        let score: number;

        // If embeddings are available, use vector similarity
        if (this.genaiClient && queryEmbedding.length > 0) {
          // Generate embedding for the section
          const sectionEmbedding = await this.generateEmbedding(section);

          // Calculate vector similarity score
          const vectorScore = this.cosineSimilarity(queryEmbedding, sectionEmbedding);

          // Scale the score from [-1, 1] to [0, 1]
          const scaledVectorScore = (vectorScore + 1) / 2;

          // Calculate keyword-based score as a fallback
          const keywordScore = this.calculateRelevanceScore(section, query);

          // Combine scores with more weight on vector similarity
          score = scaledVectorScore * 0.7 + keywordScore * 0.3;
        } else {
          // Fall back to keyword-based scoring if embeddings are not available
          score = this.calculateRelevanceScore(section, query);
        }

        return { section, score };
      }));

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
        try {
          // Try to extract just the criteria part if it's mixed with other content
          const criteriaMatch = section.match(/criterios diagnósticos[\s\S]*?(?=\n\n\w|$)/i);
          if (criteriaMatch && criteriaMatch[0].length > 100) {
            processedSections.push(criteriaMatch[0]);
            // Also keep the original section
            processedSections.push(section);
            continue;
          }
        } catch (error) {
          console.warn('Error extracting criteria section:', error);
          // Just add the original section if there's an error
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

    // Split the query into words and phrases
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 3);

    // Extract potential disorder names and codes from the query
    let disorderMatches: string[] = [];
    try {
      const disorderRegex = /(trastorno|síndrome|desorden)\s+de\s+[\w\s]+/gi;
      disorderMatches = queryLower.match(disorderRegex) || [];
    } catch (error) {
      console.warn('Error extracting disorder names from query:', error);
    }

    // Extract diagnostic codes (like F41.1)
    let codeMatches: string[] = [];
    try {
      const codeRegex = /[A-Z]?\d+(\.\d+)?/g;
      codeMatches = queryLower.match(codeRegex) || [];
    } catch (error) {
      console.warn('Error extracting diagnostic codes from query:', error);
    }

    // Calculate the score based on word occurrences
    let score = 0;

    // Exact phrase match has high weight
    if (sectionLower.includes(queryLower)) {
      score += 0.6;
    }

    // Individual word matches with weighted importance
    const importantTerms = [
      'criterios', 'diagnóstico', 'trastorno', 'síntomas', 'signos',
      'evaluación', 'características', 'manual', 'dsm', 'dsm-5'
    ];

    for (const word of queryWords) {
      // Check if this is an important clinical term
      const isImportantTerm = importantTerms.some(term => word.includes(term));
      const wordWeight = isImportantTerm ? 0.15 : 0.1;

      if (sectionLower.includes(word)) {
        // Add score based on word frequency with importance weighting
        try {
          // Escape special regex characters to prevent syntax errors
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedWord, 'gi');
          const matches = sectionLower.match(regex);
          if (matches) {
            score += wordWeight * Math.min(matches.length, 5) / queryWords.length;
          }
        } catch (regexError) {
          console.warn(`Error creating regex for word '${word}':`, regexError);
          // Fallback: just check if the word is included
          if (sectionLower.includes(word)) {
            score += wordWeight * 0.5 / queryWords.length;
          }
        }
      }
    }

    // Bonus for disorder name matches
    for (const disorder of disorderMatches) {
      try {
        // Escape special regex characters to prevent syntax errors
        const escapedDisorder = disorder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (sectionLower.includes(escapedDisorder)) {
          score += 0.3; // Significant bonus for disorder name match
          break; // Only count once
        }
      } catch (error) {
        console.warn(`Error processing disorder name '${disorder}':`, error);
        // Fallback: just check if the disorder is included
        if (sectionLower.includes(disorder)) {
          score += 0.3;
          break;
        }
      }
    }

    // Bonus for sections that contain diagnostic codes
    for (const code of codeMatches) {
      try {
        // Escape special regex characters to prevent syntax errors
        const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (sectionLower.includes(escapedCode)) {
          score += 0.25; // Significant bonus for exact code match
          break; // Only count once
        }
      } catch (error) {
        console.warn(`Error processing diagnostic code '${code}':`, error);
        // Fallback: just check if the code is included
        if (sectionLower.includes(code)) {
          score += 0.25;
          break;
        }
      }
    }

    // Detect various forms of diagnostic criteria with more flexibility
    const criteriaPatterns = [
      // Standard criteria headers
      /criterios diagnósticos/i,
      /criterio [a-z][:\.]/i,
      /criterios [a-z][:\.]/i,

      // Lettered criteria (A, B, C, etc.)
      /criterio [a-z][:\.]/i,
      /[a-z]\. (?=[A-Z])/i,

      // Numbered criteria and subcriteria
      /\d+\. (?=[A-Z])/i,
      /[a-z]\)(?= [A-Z])/i,

      // DSM-specific formatting
      /[A-Z]\. [A-Z]/,
      /\d+\. [A-Z]/
    ];

    // Check for criteria patterns
    let criteriaBonus = 0;
    for (const pattern of criteriaPatterns) {
      if (pattern.test(sectionLower)) {
        criteriaBonus += 0.1; // Add bonus for each pattern found
      }
    }

    // Cap the criteria bonus and add it to the score
    score += Math.min(criteriaBonus, 0.5);

    // Special bonus for sections that explicitly mention diagnostic criteria
    if (sectionLower.includes('criterios diagnósticos')) {
      score += 0.2;
    }

    // Extra bonus for sections with both disorder names and criteria
    if (disorderMatches.some(d => sectionLower.includes(d)) &&
        criteriaPatterns.some(p => p.test(sectionLower))) {
      score += 0.2; // This is a highly relevant section
    }

    // Cap the score at 1.0
    return Math.min(score, 1.0);
  }
}
