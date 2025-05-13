import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, authOptions } from '@/lib/auth/session-adapter'
import { prisma } from '@/lib/prisma'
import { trackEvent, EventType } from '@/lib/monitoring'

// GET: List all patients with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions)

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive') !== 'false' // Default to active patients

    // Build the query
    const query: any = {
      isActive
    }

    // Filter by userId if provided
    if (userId) {
      query.createdById = userId;
    }

    // Add search filter if provided
    if (search) {
      query.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get the patients
    const fetchAll = Boolean(userId);
    const patients = await prisma.patient.findMany({
      where: query,
      orderBy: {
        updatedAt: 'desc',
      },
      take: fetchAll ? undefined : limit,
      skip: fetchAll ? undefined : offset,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assessments: {
          orderBy: {
            assessmentDate: 'desc',
          },
          take: 1,
        },
      },
    })

    // Get the total count
    const total = await prisma.patient.count({
      where: query,
    })

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'patients_list_viewed',
      data: {
        userId: session.user.id,
        count: patients.length,
        total,
      },
    })

    // Return the patients as a flat array for dashboard use if filtering by userId
    if (userId) {
      return NextResponse.json(patients);
    }
    // Otherwise, return paginated object
    return NextResponse.json({
      items: patients,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching patients:', error)

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'patients_list_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}

// POST: Create a new patient
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions)

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.dateOfBirth || !body.contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if a patient with the same email already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { contactEmail: body.contactEmail },
    })

    if (existingPatient) {
      return NextResponse.json(
        { error: 'A patient with this email already exists' },
        { status: 409 }
      )
    }

    // Create the patient
    const patient = await prisma.patient.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        address: body.address,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        occupation: body.occupation,
        maritalStatus: body.maritalStatus,
        insuranceProvider: body.insuranceProvider,
        insuranceNumber: body.insuranceNumber,
        educationLevel: body.educationLevel,
        createdById: session.user.id,
      },
    })

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'patient_created',
      data: {
        userId: session.user.id,
        patientId: patient.id,
      },
    })

    // Return the created patient
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'patient_create_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}
