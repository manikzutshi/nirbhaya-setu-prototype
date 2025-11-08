import { redirect } from 'next/navigation';
import { auth0 } from '../../lib/auth0';
import { hasRole } from '../../lib/roles';
import WardenDashboardClient from './WardenDashboardClient';

export default async function Page() {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    redirect('/auth/login?returnTo=/warden');
  }
  if (!hasRole(session.user, 'Warden')) {
    redirect('/dashboard?unauthorized=warden');
  }
  return <WardenDashboardClient user={session.user} />;
}
