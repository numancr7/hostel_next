"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StudentDashboard from "@/components/student/StudentDashboard";

export default function StudentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (status === "loading") return;

      if (!session?.user || session.user.role !== "student") {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/student-data");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        console.error("Error fetching student dashboard data after action:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [session, status, router]);

  if (loading) {
    return <p>Loading student dashboard...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!dashboardData) {
    return <p>No data available for student dashboard.</p>;
  }

  if (!session || !session.user) {
    return <p>Authenticating session...</p>;
  }

  return (
    <StudentDashboard
      user={session.user}
      rooms={dashboardData.rooms}
      leaveRequests={dashboardData.leaveRequests}
      payments={dashboardData.payments}
    />
  );
}
