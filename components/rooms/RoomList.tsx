
import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Room, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Users, Plus } from 'lucide-react';
import { AddRoomDialog } from './AddRoomDialog';

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useLocalStorage<Room[]>('rooms', []);
  const [users] = useLocalStorage<User[]>('users', []);
  const [showAddRoom, setShowAddRoom] = useState(false);

  const students = users.filter(user => user.role === 'student');

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  const getRoomStats = () => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(room => room.occupants.length > 0).length;
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const occupiedBeds = rooms.reduce((sum, room) => sum + room.occupants.length, 0);

    return { totalRooms, occupiedRooms, totalCapacity, occupiedBeds };
  };

  const stats = getRoomStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Room Management</h2>
          <p className="text-muted-foreground">Manage room inventory and allocations</p>
        </div>
        <Button onClick={() => setShowAddRoom(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRooms}</p>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.occupiedRooms}</p>
                <p className="text-sm text-muted-foreground">Occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCapacity}</p>
                <p className="text-sm text-muted-foreground">Total Beds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.occupiedBeds}</p>
                <p className="text-sm text-muted-foreground">Occupied Beds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                  <CardDescription>{room.type}</CardDescription>
                </div>
                <Badge variant={room.occupants.length > 0 ? "default" : "secondary"}>
                  {room.occupants.length}/{room.capacity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={room.occupants.length === room.capacity ? "destructive" : "secondary"}>
                    {room.occupants.length === room.capacity ? "Full" : "Available"}
                  </Badge>
                </div>

                {room.occupants.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Occupants:</span>
                    <div className="mt-1 space-y-1">
                      {room.occupants.map((studentId) => (
                        <div key={studentId} className="text-sm text-muted-foreground">
                          • {getStudentName(studentId)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-8">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available</h3>
          <p className="text-gray-600 mb-4">Start by adding your first room to the system</p>
          <Button onClick={() => setShowAddRoom(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      )}

      <AddRoomDialog
        open={showAddRoom}
        onOpenChange={setShowAddRoom}
        onAddRoom={(room) => {
          setRooms([...rooms, { ...room, id: Date.now().toString(), occupants: [], isAvailable: true }]);
          setShowAddRoom(false);
        }}
      />
    </div>
  );
};
