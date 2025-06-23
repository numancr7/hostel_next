import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const StudentList: React.FC = () => {
  // Placeholders for users and rooms
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const students = users.filter((user: any) => user.role === 'student');
  const filteredStudents = students.filter((student: any) => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignRoom = (studentId: string, roomId: string) => {
    const updatedRooms = rooms.map((room: any) => {
      if (room.id === roomId) {
        if (room.occupants.length >= room.capacity) {
          toast({
            title: "Room full",
            description: "This room has reached its capacity",
            variant: "destructive",
          });
          return room;
        }
        return { ...room, occupants: [...room.occupants, studentId] };
      }
      // Remove student from other rooms
      return { ...room, occupants: room.occupants.filter((id: string) => id !== studentId) };
    });

    setRooms(updatedRooms);
    toast({
      title: "Room assigned",
      description: "Student has been assigned to the room",
    });
  };

  const getStudentRoom = (studentId: string) => {
    return rooms.find((room: any) => room.occupants.includes(studentId));
  };

  const availableRooms = rooms.filter(room => room.occupants.length < room.capacity);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-muted-foreground">Manage student records and room assignments</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const room = getStudentRoom(student.id);
          return (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle className="text-lg">{student.name}</CardTitle>
                <CardDescription>{student.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Room:</span>
                    {room ? (
                      <Badge variant="secondary">
                        <Home className="h-3 w-3 mr-1" />
                        {room.roomNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Assigned</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Joined:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {!room && availableRooms.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Assign Room:</span>
                      <Select onValueChange={(roomId) => assignRoom(student.id, roomId)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.roomNumber} ({room.type}) - {room.occupants.length}/{room.capacity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search criteria' : 'No students have registered yet'}
          </p>
        </div>
      )}
    </div>
  );
};
