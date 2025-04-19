import { prisma } from '../lib/prisma';

async function run() {
  // 1. Create a dummy session
  const patient = await prisma.patient.findFirst();
  const clinician = await prisma.user.findFirst({ where: { role: 'PSYCHOLOGIST' } });
  if (!patient || !clinician) throw new Error('Need at least one patient and one clinician in DB');

  const session = await prisma.session.create({
    data: {
      patientId: patient.id,
      clinicianId: clinician.id,
      type: 'test',
      status: 'draft',
    },
  });
  console.log('Session created:', session.id);

  // 2. Check AuditLog for creation
  const creationLog = await prisma.auditLog.findFirst({
    where: { entityId: session.id, action: 'CREATE', entityType: 'Session' },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Creation AuditLog:', creationLog ? 'Found' : 'Not found');

  // 3. Update session
  const updated = await prisma.session.update({
    where: { id: session.id },
    data: { status: 'completed' },
  });

  // 4. Check AuditLog for update
  const updateLog = await prisma.auditLog.findFirst({
    where: { entityId: session.id, action: 'UPDATE', entityType: 'Session' },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Update AuditLog:', updateLog ? 'Found' : 'Not found');

  // 5. Delete session
  await prisma.session.delete({ where: { id: session.id } });

  // 6. Check AuditLog for delete
  const deleteLog = await prisma.auditLog.findFirst({
    where: { entityId: session.id, action: 'DELETE', entityType: 'Session' },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Delete AuditLog:', deleteLog ? 'Found' : 'Not found');
}

run()
  .then(() => {
    console.log('Audit log test completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during audit log test:', err);
    process.exit(1);
  });
