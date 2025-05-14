/**
 * Audit Log Utility
 *
 * This file provides utilities for logging audit events in the application.
 * It is used to track user actions for security and compliance purposes.
 * HIPAA compliance requires comprehensive audit logging of all access to PHI.
 */

import prismaAlpha from './prisma-alpha';
import { NextRequest } from 'next/server';

// Define the audit action types
export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'ACCESS'
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET'
  | 'EMAIL_CONFIRMED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'SHARE'
  | 'REVOKE';

export interface AuditLogDetails {
  before?: any;
  after?: any;
  source?: string;
  reason?: string;
  [key: string]: any;
}

/**
 * Logs an audit event for HIPAA-compliant tracking.
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
  try {
    // Extract request information if available
    let ipAddress: string | undefined = undefined;
    let userAgent: string | undefined = undefined;

    if (req) {
      // Extract IP from request headers
      ipAddress = req.headers.get('x-forwarded-for') ||
                  req.headers.get('x-real-ip') ||
                  'unknown';

      // Extract user agent for device tracking
      userAgent = req.headers.get('user-agent') || 'unknown';
    }

    // Create the audit log entry
    const auditLog = await prismaAlpha.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        createdAt: new Date(),
      },
    });

    return auditLog;
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw the error to prevent disrupting the main flow
    return null;
  }
}

/**
 * Get audit logs for a user
 * @param userId The user ID
 * @param limit The maximum number of logs to return
 * @param offset The offset for pagination
 * @returns The audit logs
 */
export async function getUserAuditLogs(userId: string, limit = 50, offset = 0) {
  try {
    const auditLogs = await prismaAlpha.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return auditLogs;
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    throw error;
  }
}
