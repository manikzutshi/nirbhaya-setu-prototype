import { auth0 } from '../../../../lib/auth0';

export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
  }
  // Avoid leaking tokens
  const { user } = session;
  return new Response(
    JSON.stringify({
      authenticated: true,
      rolesExtracted: extractRoles(user),
      keys: Object.keys(user),
      sample: Object.fromEntries(
        Object.entries(user).filter(([k]) => /role|name|email|nickname/i.test(k))
      ),
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}

function extractRoles(user) {
  const found = new Set();
  if (!user || typeof user !== 'object') return [];
  for (const [key, val] of Object.entries(user)) {
    if (/roles?/i.test(key) && Array.isArray(val)) {
      for (const r of val) if (typeof r === 'string') found.add(r);
    }
  }
  const ns = process.env.AUTH0_ROLES_NAMESPACE;
  if (ns && Array.isArray(user[ns])) {
    for (const r of user[ns]) if (typeof r === 'string') found.add(r);
  }
  if (Array.isArray(user.roles)) {
    for (const r of user.roles) if (typeof r === 'string') found.add(r);
  }
  return Array.from(found);
}
