"use client";

import React from 'react';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    // Show a loading spinner while session is being fetched
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!session?.user) {
    router.push('/login');
    return null;
  }

  return (session.user as any).role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
} 