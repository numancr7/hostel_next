import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Clock, DollarSign, User as UserIcon } from 'lucide-react';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { useRouter } from 'next/navigation';
import { AddRoomDialog } from '@/components/rooms/AddRoomDialog';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession, signOut } from 'next-auth/react';
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(1, "Confirm new password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});

interface StudentDashboardProps {
  user: any;
  rooms: any[];
  leaveRequests: any[];
  payments: any[];
  refreshData: () => void;
}

export default function StudentDashboard({
  user,
  rooms,
  leaveRequests,
  payments,
  refreshData,
}: StudentDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('overview');

  const studentRoom = rooms.find(room => room.occupants.includes(user.id));
  const pendingLeave = leaveRequests.filter(req => req.status === 'pending');
  const pendingPayments = payments.filter(payment => payment.status === 'pending');

  const [profileForm, setProfileForm] = React.useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [profileErrors, setProfileErrors] = React.useState<Partial<Record<keyof typeof profileForm, string>>>({});
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = React.useState<Partial<Record<keyof typeof passwordForm, string>>>({});
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  const { toast } = useToast();
  const { update: updateSession } = useSession();

  const leaveRequestSchema = z.object({
    reason: z.string().min(10, "Reason must be at least 10 characters long"),
    fromDate: z.string().datetime("Invalid 'From Date' format"),
    toDate: z.string().datetime("Invalid 'To Date' format"),
  }).refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "'From Date' cannot be after 'To Date'",
    path: ["fromDate", "toDate"],
  });

  const [leaveForm, setLeaveForm] = React.useState({ reason: '', fromDate: '', toDate: '' });
  const [leaveErrors, setLeaveErrors] = React.useState<Partial<Record<keyof typeof leaveForm, string>>>({});
  const [isSubmittingLeave, setIsSubmittingLeave] = React.useState(false);

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePasswordChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(profileForm);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof profileForm, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof typeof profileForm] = err.message;
      });
      setProfileErrors(fieldErrors);
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        updateSession();
      } else {
        toast({
          title: "Profile Update Failed",
          description: data.message || "An error occurred while updating your profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = changePasswordSchema.safeParse(passwordForm);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof passwordForm, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof typeof passwordForm] = err.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/student/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully. Please log in again with your new password.",
        });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" }); // Clear form
        // Sign out the user to invalidate the current session and force re-login
        signOut({ callbackUrl: '/login?reset=true' });
      } else {
        toast({
          title: "Password Change Failed",
          description: data.message || "An error occurred while changing your password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast({
        title: "Error",
        description: "Network error or server issue.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLeaveChange = (field: keyof typeof leaveForm, value: string) => {
    setLeaveForm((prev) => ({ ...prev, [field]: value }));
    setLeaveErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Append time information to convert date strings to datetime strings
    const formattedLeaveForm = {
      ...leaveForm,
      fromDate: leaveForm.fromDate ? `${leaveForm.fromDate}T00:00:00Z` : '',
      toDate: leaveForm.toDate ? `${leaveForm.toDate}T23:59:59Z` : '',
    };

    const result = leaveRequestSchema.safeParse(formattedLeaveForm);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof leaveForm, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof typeof leaveForm] = err.message;
      });
      setLeaveErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });
      if (res.ok) {
        toast({ title: 'Leave Request Submitted', description: 'Your leave request has been submitted.' });
        setLeaveForm({ reason: '', fromDate: '', toDate: '' });
        refreshData();
      } else {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.errors ? Object.values(data.errors).join(", ") : (data.error || 'Failed to submit leave request.'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Network error or server issue.', variant: 'destructive' });
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leave':
        return <LeaveRequestList leaveRequests={leaveRequests} refreshData={refreshData} />;
      case 'payments':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Payments</h2>
            {payments.length === 0 ? (
              <p>No payment records found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {payments.map((payment) => (
                  <Card key={payment.id}>
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
      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Profile</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  placeholder="Your full name"
                />
                {profileErrors.name && <div className="text-red-500 text-xs">{profileErrors.name}</div>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  placeholder="Your phone number"
                />
                {profileErrors.phone && <div className="text-red-500 text-xs">{profileErrors.phone}</div>}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => handleProfileChange("address", e.target.value)}
                  placeholder="Your address"
                />
                {profileErrors.address && <div className="text-red-500 text-xs">{profileErrors.address}</div>}
              </div>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    required
                    placeholder="Your current password"
                  />
                  {passwordErrors.currentPassword && <div className="text-red-500 text-xs">{passwordErrors.currentPassword}</div>}
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    required
                    placeholder="Your new password"
                  />
                  {passwordErrors.newPassword && <div className="text-red-500 text-xs">{passwordErrors.newPassword}</div>}
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => handlePasswordChange("confirmNewPassword", e.target.value)}
                    required
                    placeholder="Confirm your new password"
                  />
                  {passwordErrors.confirmNewPassword && <div className="text-red-500 text-xs">{passwordErrors.confirmNewPassword}</div>}
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </div>
          </div>
        );
      case 'request-leave':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request Leave</h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  type="text"
                  value={leaveForm.reason}
                  onChange={(e) => handleLeaveChange("reason", e.target.value)}
                  placeholder="Reason for leave"
                />
                {leaveErrors.reason && <div className="text-red-500 text-xs">{leaveErrors.reason}</div>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={(e) => handleLeaveChange("fromDate", e.target.value)}
                  />
                  {leaveErrors.fromDate && <div className="text-red-500 text-xs">{leaveErrors.fromDate}</div>}
                </div>
                <div>
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={leaveForm.toDate}
                    onChange={(e) => handleLeaveChange("toDate", e.target.value)}
                  />
                  {leaveErrors.toDate && <div className="text-red-500 text-xs">{leaveErrors.toDate}</div>}
                </div>
              </div>
              <Button type="submit" disabled={isSubmittingLeave}>
                {isSubmittingLeave ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
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
            { id: 'payments', label: 'Payments' },
            { id: 'profile', label: 'Profile Settings' },
            { id: 'request-leave', label: 'Request Leave' },
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