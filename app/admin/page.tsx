"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    if (status === "loading") return;

    if (!session?.user || session.user.role !== "admin") {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/admin-data");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const refreshAdminData = () => {
    setLoading(true); // Show loading state while refreshing
    fetchAdminData();
  };

  if (loading) {
    return <p>Loading admin dashboard...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!dashboardData) {
    return <p>No data available for admin dashboard.</p>;
  }

  return (
    <AdminDashboard
      users={dashboardData.users}
      rooms={dashboardData.rooms}
      leaveRequests={dashboardData.leaveRequests}
      payments={dashboardData.payments}
      refreshData={refreshAdminData}
    />
  );
}
