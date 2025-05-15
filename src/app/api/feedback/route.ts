import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { trackEvent, EventType } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    // Get the current user session using Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Parse the request body
    const body = await request.json()

    // Validate the request
    if (!body.text || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the feedback record
    const feedback = await prisma.aIFeedback.create({
      data: {
        type: body.type,
        text: body.text,
        screenshot: body.screenshot,
        url: body.metadata?.url,
        userAgent: body.metadata?.userAgent,
        userId: user?.id || body.metadata?.userId || 'anonymous',
        metadata: body.metadata || {},
      },
    })

    // Track the feedback event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'feedback_received',
      data: {
        feedbackId: feedback.id,
        feedbackType: body.type,
        url: body.metadata?.url,
      },
    })

    // Return success response
    return NextResponse.json({ success: true, feedbackId: feedback.id })
  } catch (error) {
    console.error('Error handling feedback:', error)

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'feedback_api_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user session using Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check if the user is authenticated
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the user is authorized (admin or supervisor)
    const userRole = user.app_metadata?.role || 'USER'
    if (!['ADMIN', 'SUPERVISOR'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')

    // Build the query
    const query: any = {}
    if (type) {
      query.type = type
    }

    // Get the feedback items
    const feedback = await prisma.aIFeedback.findMany({
      where: query,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Get the total count
    const total = await prisma.aIFeedback.count({
      where: query,
    })

    // Return the feedback items
    return NextResponse.json({
      items: feedback,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
