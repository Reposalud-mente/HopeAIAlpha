"use client"

import React, { useState } from 'react'
import { MessageSquare, X, ThumbsUp, ThumbsDown, Send, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useFeatureFlags } from '@/contexts/FeatureFlagContext'
import { FeatureFlag } from '@/lib/feature-flags'
import { trackUserAction } from '@/lib/monitoring'

interface FeedbackWidgetProps {
  pageUrl?: string
  userId?: string
  userRole?: string
}

export function FeedbackWidget({ pageUrl, userId, userRole }: FeedbackWidgetProps) {
  const { isEnabled } = useFeatureFlags()
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'issue' | 'suggestion' | 'general'>('general')
  const [feedbackText, setFeedbackText] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only show the widget if the alpha feedback feature is enabled
  if (!isEnabled(FeatureFlag.ALPHA_FEEDBACK)) {
    return null
  }

  const toggleWidget = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      trackUserAction('feedback_widget_opened')
    }
  }

  const resetForm = () => {
    setFeedbackType('general')
    setFeedbackText('')
    setScreenshot(null)
    setIsSubmitted(false)
    setError(null)
  }

  const closeWidget = () => {
    setIsOpen(false)
    resetForm()
  }

  const captureScreenshot = async () => {
    try {
      // This is a simplified version - in a real implementation, you'd use a library
      // like html2canvas or a browser extension API
      trackUserAction('feedback_screenshot_requested')
      
      // Placeholder for actual screenshot functionality
      alert('Screenshot functionality would be implemented here')
      
      // Mock implementation
      setScreenshot('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
    } catch (err) {
      console.error('Failed to capture screenshot:', err)
      setError('Failed to capture screenshot. Please try again.')
    }
  }

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      setError('Please enter some feedback text')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Track the feedback submission
      trackUserAction('feedback_submitted', { feedbackType })

      // Prepare the feedback data
      const feedbackData = {
        type: feedbackType,
        text: feedbackText,
        screenshot: screenshot,
        metadata: {
          timestamp: new Date().toISOString(),
          url: pageUrl || window.location.href,
          userAgent: navigator.userAgent,
          userId,
          userRole,
        },
      }

      // Send the feedback to the server
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      // Show success message
      setIsSubmitted(true)
      setFeedbackText('')
      setScreenshot(null)
      
      // Close the widget after a delay
      setTimeout(() => {
        closeWidget()
      }, 3000)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Feedback button */}
      <Button
        onClick={toggleWidget}
        className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        size="icon"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
      </Button>

      {/* Feedback panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-medium">Alpha Feedback</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeWidget}
              className="h-6 w-6 text-white hover:bg-blue-700 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            {isSubmitted ? (
              <div className="text-center py-6">
                <ThumbsUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h4 className="text-lg font-medium text-gray-900">Thank You!</h4>
                <p className="text-gray-600">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex space-x-2 mb-3">
                    <Button
                      variant={feedbackType === 'issue' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFeedbackType('issue')}
                      className={feedbackType === 'issue' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Issue
                    </Button>
                    <Button
                      variant={feedbackType === 'suggestion' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFeedbackType('suggestion')}
                      className={feedbackType === 'suggestion' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Suggestion
                    </Button>
                    <Button
                      variant={feedbackType === 'general' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFeedbackType('general')}
                    >
                      General
                    </Button>
                  </div>

                  <Textarea
                    placeholder={
                      feedbackType === 'issue'
                        ? 'Describe the issue you encountered...'
                        : feedbackType === 'suggestion'
                        ? 'Share your suggestion for improvement...'
                        : 'Enter your feedback here...'
                    }
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={captureScreenshot}
                    disabled={isSubmitting}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    {screenshot ? 'Retake Screenshot' : 'Add Screenshot'}
                  </Button>

                  <Button
                    onClick={submitFeedback}
                    disabled={isSubmitting || !feedbackText.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="h-4 w-4 mr-1" />
                        Submit
                      </span>
                    )}
                  </Button>
                </div>

                {screenshot && (
                  <div className="mb-4 relative">
                    <div className="text-xs text-gray-500 mb-1">Screenshot Preview:</div>
                    <div className="border border-gray-200 rounded p-1 relative">
                      <img
                        src={screenshot}
                        alt="Screenshot"
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={() => setScreenshot(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 mt-2">{error}</div>
                )}

                <div className="text-xs text-gray-500 mt-2">
                  Your feedback helps us improve the alpha version. Thank you for participating!
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
