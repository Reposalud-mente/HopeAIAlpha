import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit-log';

// Supported export formats
const SUPPORTED_FORMATS = ['json', 'fhir', 'hl7'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const format = request.nextUrl.searchParams.get('format') || 'json';
    if (!SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 });
    }
    const found = await prisma.session.findUnique({ where: { id } });
    if (!found) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    // TODO: Add FHIR/HL7 serialization logic
    let exported: any = found;
    let mimeType = 'application/json';
    if (format === 'fhir') {
      // exported = convertToFHIR(found);
      mimeType = 'application/fhir+json';
    } else if (format === 'hl7') {
      // exported = convertToHL7(found);
      mimeType = 'application/hl7-v2';
    }
    await logAuditEvent({
      userId: session.user.id,
      action: 'EXPORT',
      entityId: id,
      entityType: 'Session',
      details: { format },
      req: request,
    });
    return new NextResponse(JSON.stringify(exported), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename=session-${id}.${format}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export session', details: error }, { status: 500 });
  }
}
