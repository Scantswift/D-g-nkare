import { cookies } from 'next/headers';

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('adminAuth');
  return adminAuth?.value === 'true';
}
