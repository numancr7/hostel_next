

export interface User {
  id?: string;
  email: string;
  password?: string; // Optional for security - only used during auth
  name: string;
  role: 'admin' | 'student';
  roomId?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: 'AC' | 'Non-AC';
  occupants: string[];
  isAvailable: boolean;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: 'room_rent' | 'mess_fee' | 'other';
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
}
