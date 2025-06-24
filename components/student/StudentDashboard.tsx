import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Clock, DollarSign } from 'lucide-react';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { useRouter } from 'next/navigation';
import { AddRoomDialog } from '@/components/rooms/AddRoomDialog';

interface StudentDashboardProps {
  user: any;
  rooms: any[];
  leaveRequests: any[];
  payments: any[];
}

export default function StudentDashboard({
  user,
  rooms,
  leaveRequests,
  payments,
}: StudentDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('overview');

  const studentRoom = rooms.find(room => room.occupants.includes(user.id));
  const pendingLeave = leaveRequests.filter(req => req.status === 'pending');
  const pendingPayments = payments.filter(payment => payment.status === 'pending');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leave':
        return <LeaveRequestList leaveRequests={leaveRequests} />;
      case 'payments':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Payments</h2>
            {payments.length === 0 ? (
              <p>No payment records found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {payments.map((payment) => (
                  <Card key={payment._id}>
                    <CardHeader>
                      <CardTitle>Payment for {payment.month}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Amount: ${payment.amount}</p>
                      <p>Status: {payment.status}</p>
                      <p>Due Date: {new Date(payment.dueDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Room</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {studentRoom ? (
                  <div className="text-2xl font-bold">{studentRoom.roomNumber}</div>
                ) : (
                  <div className="text-xl font-bold">No room assigned</div>
                )}
                {studentRoom && (
                  <p className="text-xs text-muted-foreground">
                    Rent: ${studentRoom.rent}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Leave</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingLeave.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPayments.length}</div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Your student dashboard</p>
      </div>
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'leave', label: 'Leave Requests' },
            { id: 'payments', label: 'Payments' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      {renderTabContent()}
    </div>
  );
} 