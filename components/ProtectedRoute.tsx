import React from 'react';
import { useSession } from 'next-auth/react'; // Use NextAuth session
import { useRouter } from 'next/navigation'; // Use Next.js router

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!session?.user) {
    router.push('/login');
    return null;
  }

  // If role is required and doesn't match, redirect to home
  if (requiredRole && (session.user as any).role !== requiredRole) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
};
