import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddEditPaymentDialog } from './AddEditPaymentDialog';
import { Payment, User } from '@/types';

interface PaymentListProps {
  payments: Payment[];
  users: User[]; // All users (to select student for payment)
  refreshData: () => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  users,
  refreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localPayments, setLocalPayments] = useState(payments);
  const [isAddEditPaymentDialogOpen, setIsAddEditPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setLocalPayments(payments);
  }, [payments]);

  const filteredPayments = localPayments.filter(
    (payment: Payment) => {
      const student = users.find(user => user.id === payment.studentId);
      return (
        student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) {
      return;
    }

    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Payment Deleted",
          description: data.message || 'Payment record deleted successfully.',
        });
        refreshData();
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || data.message || 'An error occurred.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSaved = () => {
    setIsAddEditPaymentDialogOpen(false);
    setEditingPayment(null);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Management</h2>
          <p className="text-muted-foreground">Manage student payment records</p>
        </div>
        <Button
          onClick={() => {
            setEditingPayment(null);
            setIsAddEditPaymentDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{users.find(user => user.id === payment.studentId)?.name || 'N/A'}</CardTitle>
                  <CardDescription>for {payment.month} {payment.year}</CardDescription>
                </div>
                <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'overdue' ? 'destructive' : 'secondary'}>
                  {payment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm text-muted-foreground">${payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Due Date:</span>
                  <span className="text-sm text-muted-foreground">{new Date(payment.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPayment(payment);
                      setIsAddEditPaymentDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePayment(payment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredPayments.length === 0 && (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search criteria' : 'No payment records have been added yet'}
          </p>
        </div>
      )}

      <Dialog open={isAddEditPaymentDialogOpen} onOpenChange={setIsAddEditPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPayment ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
            <DialogDescription>
              {editingPayment ? 'Edit the details of this payment record.' : 'Create a new payment record.'}
            </DialogDescription>
          </DialogHeader>
          <AddEditPaymentDialog
            open={isAddEditPaymentDialogOpen}
            onOpenChange={setIsAddEditPaymentDialogOpen}
            onPaymentSaved={handlePaymentSaved}
            editingPayment={editingPayment}
            students={users.filter(user => user.role === 'student')} // Pass only students
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 