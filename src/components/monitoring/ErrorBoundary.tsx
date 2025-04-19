"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { trackError } from '@/lib/monitoring'
import { FeatureFlag } from '@/lib/feature-flags'
import { useFeatureFlags } from '@/contexts/FeatureFlagContext'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Track the error with our monitoring system
    // Handle the case where componentStack could be null
    trackError(error, errorInfo.componentStack || undefined)

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.resetErrorBoundary)
      }

      if (fallback) {
        return fallback
      }

      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">The application encountered an unexpected error.</p>
          <button
            type="button"
            onClick={this.resetErrorBoundary}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return children
  }
}

/**
 * Debug Error Boundary that shows detailed error information in development/alpha environments
 */
export function DebugErrorBoundary({ children }: { children: ReactNode }) {
  const { isEnabled } = useFeatureFlags()
  const showDebugInfo = isEnabled(FeatureFlag.DEBUG_TOOLS)

  const debugFallback = (error: Error, reset: () => void) => (
    <div className="p-6 border border-amber-300 rounded-lg bg-amber-50 text-amber-900 max-w-4xl mx-auto my-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Error Detected</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Error Message:</h3>
        <div className="bg-white p-3 rounded border border-amber-200 font-mono text-red-800">
          {error.message || 'Unknown error'}
        </div>
      </div>

      {showDebugInfo && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Stack Trace:</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {error.stack || 'No stack trace available'}
          </pre>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Try Again
        </button>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reload Page
        </button>
      </div>

      {showDebugInfo && (
        <div className="mt-6 text-sm text-gray-600">
          <p>You're seeing detailed error information because you're in a development or alpha environment.</p>
        </div>
      )}
    </div>
  )

  return (
    <ErrorBoundaryClass fallback={debugFallback}>
      {children}
    </ErrorBoundaryClass>
  )
}

/**
 * Default Error Boundary for production use
 */
export default function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundaryClass>
  )
}
