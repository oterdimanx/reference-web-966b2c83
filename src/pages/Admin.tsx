
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import AdminMenu from '@/components/Admin/AdminMenu';
import UserTable from '@/components/Admin/UserTable';
import AddAdminForm from '@/components/Admin/AddAdminForm';
import { useAdminStatus } from '@/hooks/use-admin-status';
import { useAdminUsers } from '@/hooks/use-admin-users';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const { isAdmin, adminLoading } = useAdminStatus(user?.id);
  const { users, usersLoading, addNewAdmin } = useAdminUsers(isAdmin);

  // If not logged in, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  // If loading admin status
  if (loading || adminLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold mb-4 text-red-600">Access Denied</h2>
                <p className="mb-6 text-muted-foreground">
                  You don't have administrator privileges to access this page.
                </p>
                <Button 
                  variant="default" 
                  onClick={() => window.location.href = '/'}
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <AdminMenu />
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Admin</CardTitle>
              <CardDescription>
                Grant administrator privileges to another user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddAdminForm onAdminAdded={addNewAdmin} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable users={users} usersLoading={usersLoading} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
