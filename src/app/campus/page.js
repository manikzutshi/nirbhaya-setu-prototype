// Import without alias since project root uses relative paths.
import { auth0 } from '../../lib/auth0';
import { redirect } from 'next/navigation';
import CampusSecureClient from './CampusSecureClient';

// Server component: role-gates the Campus Secure experience.
// Assumptions:
// - Roles are provided either at session.user['https://nirbhayasetu/roles'] (recommended custom namespace)
//   or session.user.roles (fallback).
// - "Student" role is required.
// Adjust ROLE_NAMESPACE via environment variable AUTH0_ROLES_NAMESPACE if you later add an Auth0 Action.

export default async function Page() {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    // Unauthenticated: send to login with returnTo back here.
    redirect('/auth/login?returnTo=/campus');
  }
  return <CampusSecureClient user={session.user} />;
}
