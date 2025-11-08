import ProfileClient from './ProfileClient';
import { auth0 } from '../../lib/auth0';

export default async function Page() {
  // No role gating for now per instructions; attempt to get session for greeting.
  const session = await auth0.getSession();
  return <ProfileClient user={session?.user || null} />;
}
