/**
 * API route for testing the pdf-parse module
 * This is a server-side only route
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session-adapter';
import { authOptions } from '@/lib/auth/session-adapter';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

// Create a require function for CommonJS modules
const require = createRequire(import.meta.url);

// Import module dynamically to avoid client-side bundling issues
let pdfParse: any = null;

// Different approaches to load pdf-parse
const loadingApproaches = [
  {
    name: 'createRequire from module',
    loader: async () => {
      try {
        const moduleImport = await import('module');
        if (moduleImport.createRequire) {
          const require = moduleImport.createRequire(import.meta.url);
          return require('pdf-parse');
        }
        return null;
      } catch (error) {
        console.error('Error with createRequire approach:', error);
        return null;
      }
    }
  },
  {
    name: 'dynamic import',
    loader: async () => {
      try {
        const pdfParseModule = await import('pdf-parse');
        return pdfParseModule.default;
      } catch (error) {
        console.error('Error with dynamic import approach:', error);
        return null;
      }
    }
  },
  {
    name: 'regular require',
    loader: async () => {
      try {
        return require('pdf-parse');
      } catch (error) {
        console.error('Error with regular require approach:', error);
        return null;
      }
    }
  },
  {
    name: 'Function constructor with import',
    loader: async () => {
      try {
        const moduleImport = await new Function('return import("module")')();
        if (moduleImport.createRequire) {
          const require = moduleImport.createRequire(import.meta.url);
          return require('pdf-parse');
        }
        return null;
      } catch (error) {
        console.error('Error with Function constructor approach:', error);
        return null;
      }
    }
  }
];

/**
 * GET: Test the pdf-parse module
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Results array to track which approaches worked
    const results: { approach: string; success: boolean; error?: string }[] = [];

    // Try each approach
    for (const approach of loadingApproaches) {
      try {
        const result = await approach.loader();
        if (result) {
          pdfParse = result;
          results.push({ approach: approach.name, success: true });
        } else {
          results.push({ approach: approach.name, success: false, error: 'Loader returned null' });
        }
      } catch (error) {
        results.push({
          approach: approach.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Check if any approach worked
    const success = results.some(r => r.success);

    // If pdf-parse was loaded successfully, try to parse a test PDF
    let pdfParseResult = null;
    if (pdfParse) {
      try {
        // Get the project root directory
        const projectRoot = process.cwd();

        // Path to the test PDF
        const pdfPath = join(projectRoot, 'test.pdf');

        // Read the PDF file
        const dataBuffer = readFileSync(pdfPath);

        // Parse the PDF
        const data = await pdfParse(dataBuffer);

        // Store the result
        pdfParseResult = {
          success: true,
          textLength: data.text.length,
          textSample: data.text.substring(0, 100),
          info: data.info,
          metadata: data.metadata,
          version: data.version
        };
      } catch (error) {
        pdfParseResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Return the results
    return NextResponse.json({
      success,
      pdfParseLoaded: !!pdfParse,
      results,
      pdfParseResult,
      nodeVersion: process.version,
      environment: {
        isESM: typeof global.require === 'undefined',
        hasCreateRequire: typeof import.meta !== 'undefined',
        cwd: process.cwd()
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error testing pdf-parse:', error);

    // Return error response
    return NextResponse.json(
      { error: 'Failed to test pdf-parse', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
