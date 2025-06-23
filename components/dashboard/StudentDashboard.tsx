import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Clock, DollarSign, User } from 'lucide-react';
import Link from 'next/link';

export const StudentDashboard: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [rooms] = useState<any[]>([]);
  const [leaveRequests] = useState<any[]>([]);
  const [payments] = useState<any[]>([]);

  if (!user) return null;

  const studentRoom = rooms.find(room => room.occupants?.includes(user.id));
  const studentLeaveRequests = leaveRequests.filter(req => req.studentId === user.id);
  const studentPayments = payments.filter(payment => payment.studentId === user.id);
  const pendingPayments = studentPayments.filter(payment => payment.status === 'pending');

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome, {user.name || user.email}</p>
      {/* Add your dashboard UI here, using the placeholders above */}
    </div>
  );
};
