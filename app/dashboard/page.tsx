"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading

    if (!session?.user) {
      router.push("/login");
    } else if (session.user.role === "admin") {
      router.push("/admin");
    } else if (session.user.role === "student") {
      router.push("/student");
    }
  }, [session, status, router]);

  return <p>Loading dashboard...</p>;
} 