import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { verifyAdmin } from '@/lib/admin-auth';

export default async function DashboardPage() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return null;
  }
  return <AdminDashboard />;
}
