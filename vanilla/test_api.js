// Simple test script to verify vanilla backend endpoints.
// Run: node vanilla/test_api.js

const BASE = process.env.API_BASE || 'http://localhost:3000';

async function ok(res) {
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json().catch(() => null);
}

(async () => {
  console.log('GET /credentials');
  let res = await fetch(`${BASE}/credentials`);
  console.log(await ok(res));

  console.log('POST /credentials');
  res = await fetch(`${BASE}/credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site: 'test.local', username: 'me', password: 'secret' }) });
  const created = await ok(res);
  console.log('created', created);

  console.log('DELETE /credentials/:id');
  res = await fetch(`${BASE}/credentials/${created.id}`, { method: 'DELETE' });
  console.log(await ok(res));

  console.log('done');
})();