import crypto from 'crypto';

// Mock reports history API returning sample incident reports
// Future: replace with DB + Solana transaction signatures persisted after writing hashes on-chain.
export async function GET() {
  const now = Date.now();
  const reports = [
    {
      id: 'rep-' + Math.random().toString(36).slice(2, 8),
      timestamp: new Date(now - 3600_000).toISOString(),
      summary: 'Suspicious activity near hostel gate',
  hash: sha256HexSync('Suspicious activity near hostel gate'),
      txSignature: mockSignature(),
    },
    {
      id: 'rep-' + Math.random().toString(36).slice(2, 8),
      timestamp: new Date(now - 7200_000).toISOString(),
      summary: 'Street light malfunction reported',
  hash: sha256HexSync('Street light malfunction reported'),
      txSignature: mockSignature(),
    },
  ];
  return new Response(JSON.stringify({ reports }), { status: 200, headers: { 'content-type': 'application/json' } });
}

function mockSignature() {
  // 88-char base58-like stub
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let out = '';
  for (let i = 0; i < 64; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function sha256HexSync(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}