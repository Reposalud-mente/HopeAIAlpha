const http = require('http');

// Helper to make HTTP requests
function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body ? Buffer.byteLength(body) : 0
      }
    };
    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, body: chunks });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  // 1. Create a session (adjust patientId/clinicianId as needed)
  const patientId = '42f8a41a-34a5-4961-b3b0-3598218f8dba'; // Pedro patient
  const clinicianId = '24312c0a-6317-4741-9330-ff581e2a24f3'; // admin@hopeai.com
  const createData = { patientId, clinicianId, type: 'test', status: 'draft' };
  const createRes = await request('POST', '/api/sessions', createData);
  console.log('Create session:', createRes.status, createRes.body);
  if (!createRes.body.id) throw new Error('No session created');
  const sessionId = createRes.body.id;

  // 2. Update session
  const updateRes = await request('PUT', `/api/sessions/${sessionId}`, { status: 'completed' });
  console.log('Update session:', updateRes.status, updateRes.body);

  // 3. Delete session
  const deleteRes = await request('DELETE', `/api/sessions/${sessionId}`);
  console.log('Delete session:', deleteRes.status, deleteRes.body);

  // 4. (Optional) Query AuditLog via DB or a future API endpoint to check logs
  console.log('Now check your AuditLog table for entries for this session.');
})();
