"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useSession } from 'next-auth/react';
import { Pencil, Trash2 } from 'lucide-react';

// StudentList now receives users and rooms as props from the parent
export const StudentList: React.FC<{ users: any[]; rooms: any[]; refreshData: () => void }> = ({
  users,
  rooms,
  refreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localRooms, setLocalRooms] = useState(rooms); // Initialize with props
  const [isAddEditStudentDialogOpen, setIsAddEditStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  const students = users.filter((user: any) => user.role === 'student');
  const filteredStudents = students.filter(
    (student: any) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignRoom = async (studentId: string, roomId: string) => {
    const studentCurrentRoom = getStudentRoom(studentId);
    let updatedRoomsData = [...localRooms];

    // Remove student from their current room if they are in one
    if (studentCurrentRoom) {
      updatedRoomsData = updatedRoomsData.map((room: any) =>
        room.id === studentCurrentRoom.id
          ? { ...room, occupants: room.occupants.filter((id: string) => id !== studentId) }
          : room
      );
    }

    // Add student to the new room
    const targetRoom = updatedRoomsData.find((room: any) => room.id === roomId);
    if (targetRoom) {
      if (targetRoom.occupants.length >= targetRoom.capacity) {
        toast({
          title: "Room full",
          description: "This room has reached its capacity",
          variant: "destructive",
        });
        return; // Exit if room is full
      }
      targetRoom.occupants.push(studentId);
    }

    try {
      // Update the old room (if any)
      if (studentCurrentRoom) {
        await fetch(`/api/rooms/${studentCurrentRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ occupants: studentCurrentRoom.occupants.filter((id: string) => id !== studentId) }),
        });
      }

      // Update the new room
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupants: targetRoom.occupants }),
      });

      setLocalRooms(updatedRoomsData);
      toast({
        title: "Room assigned",
        description: "Student has been assigned to the room",
      });
      router.refresh(); // Refresh data after successful assignment
    } catch (error) {
      console.error("Failed to assign room:", error);
      toast({
        title: "Error assigning room",
        description: "Could not assign student to the room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (session?.user?.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to perform this action.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin-data/students/${studentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: "Student Deleted",
          description: "Student record deleted successfully.",
        });
        refreshData();
      } else {
        const data = await res.json();
        toast({
          title: "Deletion Failed",
          description: data.error || data.message || 'An error occurred during deletion.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    }
  };

  const getStudentRoom = (studentId: string) => {
    return localRooms.find((room: any) => room.occupants.includes(studentId));
  };

  const availableRooms = localRooms.filter(room => room.occupants.length < room.capacity);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-muted-foreground">Manage student records and room assignments</p>
        </div>
        <div>
          <Button
            onClick={() => {
              setEditingStudent(null);
              setIsAddEditStudentDialogOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
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
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Assign Room:</span>
                    <Select value={room?.id || ''} onValueChange={(roomId) => assignRoom(student.id, roomId)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.roomNumber} ({room.type}) - {room.occupants.length}/{room.capacity}
                          </SelectItem>
                        ))}
                        {room && <SelectItem key={room.id} value={room.id} disabled>
                          {room.roomNumber} (Current) - {room.occupants.length}/{room.capacity}
                        </SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingStudent(student);
                        setIsAddEditStudentDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

      <Dialog open={isAddEditStudentDialogOpen} onOpenChange={setIsAddEditStudentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Edit the student\'s details.' : 'Add a new student to the system.'}
            </DialogDescription>
          </DialogHeader>
          <AddEditStudentForm
            student={editingStudent}
            onSuccess={() => {
              setIsAddEditStudentDialogOpen(false);
              setEditingStudent(null);
              refreshData();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface AddEditStudentFormProps {
  student?: any;
  onSuccess: () => void;
}

const AddEditStudentForm: React.FC<AddEditStudentFormProps> = ({ student, onSuccess }) => {
  const { toast } = useToast();
  const { data: session } = useSession();

  const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: student ? z.string().optional() : z.string().min(6, { message: "Password must be at least 6 characters." }),
    role: z.enum(["student", "admin"]), // Admins can add other admins if needed
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    roomId: z.string().optional().or(z.literal("")), // Optional for initial creation, can be assigned later
  });

  type AddEditStudentFormType = z.infer<typeof formSchema>;

  const form = useForm<AddEditStudentFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student?.name || "",
      email: student?.email || "",
      password: "", // Never pre-fill passwords
      role: student?.role || "student",
      phone: student?.phone || "",
      address: student?.address || "",
      roomId: student?.roomId || "",
    },
  });

  const onSubmit = async (values: AddEditStudentFormType) => {
    if (session?.user?.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to perform this action.",
        variant: "destructive",
      });
      return;
    }

    try {
      let res;

      // Prepare data for submission, handling optional/nullable fields
      const submissionValues: Record<string, any> = { ...values };
      if (submissionValues.roomId === "") {
        submissionValues.roomId = null; // Convert empty string to null for optional roomId
      }
      if (student && submissionValues.password === "") {
        delete submissionValues.password; // Do not send empty password for updates
      }

      if (student) {
        // Update existing student
        res = await fetch(`/api/admin-data/students/${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionValues),
        });
      } else {
        // Create new student
        res = await fetch('/api/admin-data/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionValues),
        });
      }

      const data = await res.json();

      if (res.ok) {
        toast({
          title: student ? 'Student Updated' : 'Student Added',
          description: data.message || (student ? 'Student details updated successfully.' : 'New student added successfully.'),
        });
        onSuccess();
      } else {
        toast({
          title: student ? 'Update Failed' : 'Add Student Failed',
          description: data.error || data.message || 'An error occurred.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving student:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Student's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="student@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!student && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormDescription>Password is required for new students.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., +1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Student's address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room ID</FormLabel>
              <FormControl>
                <Input placeholder="Room ID (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
};
