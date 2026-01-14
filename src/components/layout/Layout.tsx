import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthProvider } from '@/hooks/useAuth';

export default function Layout() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
