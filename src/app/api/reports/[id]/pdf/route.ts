import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { trackEvent, EventType } from '@/lib/monitoring';
import { generatePDF } from '@/lib/pdf-generator';
import fs from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';

/**
 * GET: Generate and return a PDF for a report
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get the report ID from the URL
    const { id: reportId } = await params;

    // Get the report with related data
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        assessment: {
          include: {
            patient: true,
            clinician: true,
            clinic: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Check if the report exists
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Generate the PDF
    const pdfBuffer = await generatePDF(report);

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'report_pdf_generated',
      data: {
        userId: session.user.id,
        reportId: report.id,
        assessmentId: report.assessmentId,
      },
    });

    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.filename || `report_${reportId}.pdf`}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'report_pdf_generation_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

/**
 * POST: Generate a PDF for a report and save it as an attachment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get the report ID from the URL
    const { id: reportId } = await params;

    // Get the report with related data
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        assessment: {
          include: {
            patient: true,
            clinician: true,
            clinic: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Check if the report exists
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Generate the PDF
    const pdfBuffer = await generatePDF(report);

    // Create the directory structure if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
    const patientDir = path.join(uploadsDir, report.assessment.patientId);

    try {
      await mkdir(patientDir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }

    // Generate a unique filename
    const filename = report.filename || `report_${reportId}_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = path.join(patientDir, filename);
    const publicPath = `/uploads/reports/${report.assessment.patientId}/${filename}`;

    // Write the PDF to disk
    fs.writeFileSync(filePath, pdfBuffer);

    // Create an attachment record in the database
    const attachment = await prisma.attachment.create({
      data: {
        relatedEntityType: 'Report',
        relatedEntityId: reportId,
        fileName: filename,
        filePath: publicPath,
        fileType: 'application/pdf',
        fileSize: BigInt(pdfBuffer.length),
        uploadedById: session.user.id,
        patientId: report.assessment.patientId,
        description: `PDF report generated on ${new Date().toLocaleString()}`,
      },
    });

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'report_pdf_saved',
      data: {
        userId: session.user.id,
        reportId: report.id,
        assessmentId: report.assessmentId,
        attachmentId: attachment.id,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      attachmentId: attachment.id,
      filePath: publicPath,
    });
  } catch (error) {
    console.error('Error saving PDF:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'report_pdf_save_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to save PDF' },
      { status: 500 }
    );
  }
}
