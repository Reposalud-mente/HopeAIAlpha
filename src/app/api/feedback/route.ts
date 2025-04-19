import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { trackEvent, EventType } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions)
    
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
    const feedback = await prisma.feedback.create({
      data: {
        type: body.type,
        text: body.text,
        screenshot: body.screenshot,
        url: body.metadata?.url,
        userAgent: body.metadata?.userAgent,
        userId: session?.user?.id || body.metadata?.userId || 'anonymous',
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
    // Get the current user session
    const session = await getServerSession(authOptions)
    
    // Check if the user is authorized (admin or supervisor)
    if (!session?.user || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
    const feedback = await prisma.feedback.findMany({
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
    const total = await prisma.feedback.count({
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
