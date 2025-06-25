"use client";

import React, { useState, useEffect } from 'react';
import { LeaveRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

// LeaveRequestList now receives leaveRequests and refreshData as props
export const LeaveRequestList: React.FC<{ leaveRequests: LeaveRequest[]; refreshData: () => void }> = ({
  leaveRequests,
  refreshData,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [localLeaveRequests, setLocalLeaveRequests] = useState(leaveRequests);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    setLocalLeaveRequests(leaveRequests);
  }, [leaveRequests]);

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    if (session?.user?.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to perform this action.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`/api/leave-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: `Request ${status}`,
          description: data.message || `Leave request has been ${status}.`,
        });
        refreshData();
      } else {
        toast({
          title: "Update Failed",
          description: data.error || data.message || 'An error occurred while updating the request.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update leave request:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this leave request?')) {
      return;
    }

    if (session?.user?.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to perform this action.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`/api/leave-requests/${requestId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Request Deleted",
          description: data.message || 'Leave request deleted successfully.',
        });
        refreshData();
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || data.message || 'An error occurred while deleting the request.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting leave request:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = localLeaveRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusStats = () => {
    return {
      pending: localLeaveRequests.filter(r => r.status === 'pending').length,
      approved: localLeaveRequests.filter(r => r.status === 'approved').length,
      rejected: localLeaveRequests.filter(r => r.status === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Leave Request Management</h2>
        <p className="text-muted-foreground">Review and manage student leave applications</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex space-x-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{typeof request.studentId === 'object' && request.studentId !== null ? request.studentId.name : 'N/A'}</CardTitle>
                  <CardDescription>
                    {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    request.status === 'approved' ? 'default' :
                    request.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }
                >
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Reason:</span>
                  <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Submitted: {new Date(request.submittedAt).toLocaleString()}</span>
                  {request.reviewedAt && (
                    <span>Reviewed: {new Date(request.reviewedAt).toLocaleString()}</span>
                  )}
                </div>
                {session?.user?.role === 'admin' && request.status === 'pending' && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                {session?.user?.role === 'admin' && (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRequest(request.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredRequests.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests</h3>
          <p className="text-gray-600">
            {filter === 'all' ? 'No leave requests have been submitted yet' : `No ${filter} requests found`}
          </p>
        </div>
      )}
    </div>
  );
};
