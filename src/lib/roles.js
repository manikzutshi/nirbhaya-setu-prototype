// Utility helpers for extracting roles from the Auth0 user profile.
// Looks at a configured namespace (AUTH0_ROLES_NAMESPACE), generic properties that match /roles?/i, and user.roles.
// Exports getUserRoles(user) and hasRole(user, roleName).

export function getUserRoles(user) {
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

export function hasRole(user, roleName) {
  const roles = getUserRoles(user).map((r) => r.toLowerCase());
  return roles.includes(String(roleName).toLowerCase());
}
