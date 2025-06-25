import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Payment, User } from '@/types';

interface AddEditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSaved: () => void;
  editingPayment?: Payment | null;
  students: User[]; // Pass students for dropdown
}

const paymentFormSchema = z.object({
  studentId: z.string().min(1, { message: "Student is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  month: z.string().min(1, { message: "Month is required." }),
  year: z.coerce.number().int().positive({ message: "Year must be a positive integer." }),
  dueDate: z.string().min(1, { message: "Due Date is required." }),
  status: z.enum(["pending", "paid", "overdue"]),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const AddEditPaymentDialog: React.FC<AddEditPaymentDialogProps> = ({
  open,
  onOpenChange,
  onPaymentSaved,
  editingPayment,
  students,
}) => {
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: editingPayment?.studentId || "",
      amount: editingPayment?.amount || 0,
      month: editingPayment?.month || "",
      year: editingPayment?.year || new Date().getFullYear(),
      dueDate: editingPayment?.dueDate ? new Date(editingPayment.dueDate).toISOString().split('T')[0] : "",
      status: editingPayment?.status || "pending",
    },
  });

  useEffect(() => {
    if (editingPayment) {
      form.reset({
        studentId: editingPayment.studentId || "",
        amount: editingPayment.amount,
        month: editingPayment.month,
        year: editingPayment.year,
        dueDate: new Date(editingPayment.dueDate).toISOString().split('T')[0],
        status: editingPayment.status,
      });
    } else {
      form.reset({
        studentId: "",
        amount: 0,
        month: "",
        year: new Date().getFullYear(),
        dueDate: "",
        status: "pending",
      });
    }
  }, [editingPayment, open, form]);

  const onSubmit = async (values: PaymentFormValues) => {
    // Ensure dueDate is in ISO 8601 format with time for backend validation
    const formattedValues = {
      ...values,
      dueDate: values.dueDate ? `${values.dueDate}T00:00:00Z` : '',
    };

    // Frontend validation for required fields
    if (!formattedValues.studentId) {
      toast({ title: 'Error', description: 'Student is required.', variant: 'destructive' });
      return;
    }
    if (!formattedValues.amount || formattedValues.amount <= 0) {
      toast({ title: 'Error', description: 'Amount must be a positive number.', variant: 'destructive' });
      return;
    }
    if (!formattedValues.month) {
      toast({ title: 'Error', description: 'Month is required.', variant: 'destructive' });
      return;
    }
    if (!formattedValues.year || formattedValues.year <= 0) {
      toast({ title: 'Error', description: 'Year must be a positive integer.', variant: 'destructive' });
      return;
    }
    if (!formattedValues.dueDate) {
      toast({ title: 'Error', description: 'Due Date is required.', variant: 'destructive' });
      return;
    }
    try {
      const method = editingPayment ? 'PUT' : 'POST';
      const url = editingPayment ? `/api/payments/${editingPayment.id}` : '/api/payments';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedValues),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: editingPayment ? 'Payment Updated' : 'Payment Added',
          description: data.message || (editingPayment ? 'Payment details updated successfully.' : 'New payment added successfully.'),
        });
        onPaymentSaved();
        onOpenChange(false);
      } else {
        toast({
          title: editingPayment ? 'Update Failed' : 'Add Payment Failed',
          description: data.error || data.message || 'An error occurred.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingPayment ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
          <DialogDescription>
            {editingPayment ? 'Edit the details of this payment record.' : 'Create a new payment record.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingPayment}> {/* Disable student selection on edit */}
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.filter(student => student.id !== undefined && student.id !== null).map((student) => (
                        <SelectItem key={student.id} value={student.id!}>
                          {student.name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Select the due date for the payment.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Payment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 