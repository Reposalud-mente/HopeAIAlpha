import { prisma } from './prisma';
import { NextRequest } from 'next/server';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'ACCESS'
  | 'LOGIN'
  | 'LOGOUT';

export interface AuditLogDetails {
  before?: any;
  after?: any;
  [key: string]: any;
}

/**
 * Logs an audit event for a session-related action.
 * @param params - Audit log parameters
 */
export async function logAuditEvent({
  userId,
  action,
  entityId,
  entityType = 'Session',
  details,
  req,
}: {
  userId?: string;
  action: AuditAction;
  entityId: string;
  entityType?: string;
  details?: AuditLogDetails;
  req?: NextRequest;
}) {
  let ipAddress: string | undefined = undefined;
  if (req) {
    // Try to extract IP from request headers
    ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
  }
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
    },
  });
}
