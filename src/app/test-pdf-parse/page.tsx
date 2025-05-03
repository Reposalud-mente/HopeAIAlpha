'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPdfParsePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testPdfParse = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-pdf-parse');
      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Failed to test pdf-parse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">PDF Parse Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test PDF Parse Module</CardTitle>
          <CardDescription>
            This page tests if the pdf-parse module can be loaded in a server-side API route.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button below to test if the pdf-parse module can be loaded in a server-side API route.
            This will help diagnose issues with the DSM-5 retrieval functionality.
          </p>
          <Button onClick={testPdfParse} disabled={loading}>
            {loading ? 'Testing...' : 'Test PDF Parse'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Overall Status:</h3>
                <p className={results.success ? 'text-green-500' : 'text-red-500'}>
                  {results.success ? 'PDF Parse loaded successfully!' : 'Failed to load PDF Parse'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Node Version:</h3>
                <p>{results.nodeVersion}</p>
              </div>

              <div>
                <h3 className="font-semibold">Environment:</h3>
                <ul className="list-disc pl-5">
                  <li>ES Modules: {results.environment.isESM ? 'Yes' : 'No'}</li>
                  <li>Has createRequire: {results.environment.hasCreateRequire ? 'Yes' : 'No'}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Loading Approaches:</h3>
                <ul className="list-disc pl-5">
                  {results.results.map((result: any, index: number) => (
                    <li key={index} className={result.success ? 'text-green-500' : 'text-red-500'}>
                      {result.approach}: {result.success ? 'Success' : 'Failed'}
                      {result.error && <span className="block text-sm ml-2">Error: {result.error}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              {results.pdfParseResult && (
                <div>
                  <h3 className="font-semibold">PDF Parse Test:</h3>
                  {results.pdfParseResult.success ? (
                    <div className="text-green-500">
                      <p>Successfully parsed test PDF!</p>
                      <p className="text-sm mt-2">Text length: {results.pdfParseResult.textLength}</p>
                      <p className="text-sm mt-1">Sample: {results.pdfParseResult.textSample}</p>
                      {results.pdfParseResult.info && (
                        <div className="text-sm mt-2">
                          <p>PDF Info:</p>
                          <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-40">
                            {JSON.stringify(results.pdfParseResult.info, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-500">
                      <p>Failed to parse test PDF</p>
                      {results.pdfParseResult.error && (
                        <p className="text-sm mt-1">Error: {results.pdfParseResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              These results can help diagnose issues with the DSM-5 retrieval functionality.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
