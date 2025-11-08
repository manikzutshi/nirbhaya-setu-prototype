// Stub endpoint for retrieving current aggregated alerts (sos + breaches).
// Currently returns empty arrays; future implementation can persist and aggregate.
export async function GET() {
  return new Response(JSON.stringify({ sos: [], breaches: [] }), { status: 200, headers: { 'content-type': 'application/json' } });
}
