import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Home, Clock, DollarSign } from 'lucide-react';
import { StudentList } from '@/components/students/StudentList';
import { RoomList } from '@/components/rooms/RoomList';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';

// TODO: Replace with real data fetching from backend
export const AdminDashboard: React.FC = () => {
  // Removed useLocalStorage and localStorage logic
  const [users] = useState<any[]>([]); // Placeholder
  const [rooms] = useState<any[]>([]); // Placeholder
  const [leaveRequests] = useState<any[]>([]); // Placeholder
  const [payments] = useState<any[]>([]); // Placeholder
  const [activeTab, setActiveTab] = useState('overview');

  const students = users.filter(user => user.role === 'student');
  const occupiedRooms = rooms.filter((room: any) => room.occupants && room.occupants.length > 0);
  const pendingLeave = leaveRequests.filter((req: any) => req.status === 'pending');
  const pendingPayments = payments.filter((payment: any) => payment.status === 'pending');

  // Removed useEffect for sample data

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentList />;
      case 'rooms':
        return <RoomList />;
      case 'leave':
        return <LeaveRequestList />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{occupiedRooms.length}</div>
                <p className="text-xs text-muted-foreground">
                  of {rooms.length} total rooms
                </p>
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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage hostel operations and student records</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'students', label: 'Students' },
            { id: 'rooms', label: 'Rooms' },
            { id: 'leave', label: 'Leave Requests' }
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
};
