// Stub endpoints for warden late pass management.
export async function GET() {
  // Mock pending requests
  const pending = [
    {
      id: 'req-' + Math.random().toString(36).slice(2, 8),
      student: 'Aarav S.',
      until: '22:30',
      created: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'PENDING',
      reason: 'Study group in library'
    },
    {
      id: 'req-' + Math.random().toString(36).slice(2, 8),
      student: 'Priya K.',
      until: '23:00',
      created: new Date(Date.now() - 12 * 60000).toISOString(),
      status: 'PENDING',
      reason: 'Project deadline'
    }
  ];
  return new Response(JSON.stringify({ pending }), { status: 200, headers: { 'content-type': 'application/json' } });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, action } = body || {};
    if (!id || !['approve', 'deny'].includes(action)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid parameters' }), { status: 400 });
    }
    return new Response(
      JSON.stringify({ ok: true, id, status: action === 'approve' ? 'APPROVED' : 'DENIED' }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Malformed JSON' }), { status: 400 });
  }
}
