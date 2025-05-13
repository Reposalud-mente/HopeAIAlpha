import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/session-adapter'
import { authOptions } from '@/lib/auth/session-adapter'
import { prisma } from '@/lib/prisma'
import { trackEvent, EventType } from '@/lib/monitoring'

// GET: Retrieve a single patient by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get the patient ID from the URL
    const { id } = await params

    // Get the patient
    const patient = await prisma.patient.findUnique({
      where: { id },
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
          include: {
            clinician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            reports: {
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                createdBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Check if the patient exists
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'patient_viewed',
      data: {
        userId: session.user.id,
        patientId: patient.id,
      },
    })

    // Return the patient
    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'patient_view_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}

// PUT: Update a patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get the patient ID from the URL
    const { id } = await params

    // Parse the request body
    const body = await request.json()

    // Check if the patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // If email is being changed, check if it's already in use
    if (body.contactEmail && body.contactEmail !== existingPatient.contactEmail) {
      const emailExists = await prisma.patient.findUnique({
        where: { contactEmail: body.contactEmail },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'A patient with this email already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    // Only include fields that are provided in the request
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(body.dateOfBirth)
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone
    if (body.address !== undefined) updateData.address = body.address
    if (body.emergencyContactName !== undefined) updateData.emergencyContactName = body.emergencyContactName
    if (body.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = body.emergencyContactPhone
    if (body.occupation !== undefined) updateData.occupation = body.occupation
    if (body.maritalStatus !== undefined) updateData.maritalStatus = body.maritalStatus
    if (body.insuranceProvider !== undefined) updateData.insuranceProvider = body.insuranceProvider
    if (body.insuranceNumber !== undefined) updateData.insuranceNumber = body.insuranceNumber
    if (body.educationLevel !== undefined) updateData.educationLevel = body.educationLevel
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Update the patient
    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    })

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'patient_updated',
      data: {
        userId: session.user.id,
        patientId: patient.id,
      },
    })

    // Return the updated patient
    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'patient_update_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a patient (or mark as inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Note: Role restriction removed to allow any authenticated user to delete patients
    // In a production environment, you might want to add role-based restrictions

    // Get the patient ID from the URL
    const { id } = await params

    // Check if the patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Instead of deleting, mark the patient as inactive
    const patient = await prisma.patient.update({
      where: { id },
      data: { isActive: false },
    })

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'patient_deactivated',
      data: {
        userId: session.user.id,
        patientId: patient.id,
      },
    })

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating patient:', error)

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'patient_deactivate_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Failed to deactivate patient' },
      { status: 500 }
    )
  }
}
