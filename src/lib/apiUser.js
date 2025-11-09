import { auth0 } from '@/lib/auth0';

export async function getUserIdFromRequest() {
  try {
    const session = await auth0.getSession();
    return session?.user?.sub || 'anonymous';
  } catch {
    return 'anonymous';
  }
}
