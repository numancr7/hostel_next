"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import type { User } from "@/types";

const SignupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "student"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  roomId: z.string().optional(),
});

type SignupForm = z.infer<typeof SignupSchema>;

export default function Signup() {
  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    role: "student",
    phone: "",
    address: "",
    roomId: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupForm, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (field: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = SignupSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupForm, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof SignupForm] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setIsLoading(false);

    if (res.ok) {
      setShowVerificationMessage(true);
      toast({
        title: "Registration Successful",
        description: "A verification email has been sent to your inbox. Please verify your email to log in.",
      });
    } else {
      toast({
        title: "Signup Failed",
        description: data?.error || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }), // Only email is needed to resend
    });
    const data = await res.json();
    setIsLoading(false);

    if (res.ok) {
      toast({
        title: "Verification Email Resent",
        description: "Another verification email has been sent. Please check your inbox.",
      });
    } else {
      toast({
        title: "Failed to Resend Email",
        description: data?.error || "Could not resend verification email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up for a new HostelMS account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showVerificationMessage ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
                {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  placeholder="Enter your email"
                />
                {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                {errors.password && <div className="text-red-500 text-xs">{errors.password}</div>}
              </div>
              {form.role === "student" && (
                <>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="text"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Enter your address"
                    />
                    {errors.address && <div className="text-red-500 text-xs">{errors.address}</div>}
                  </div>
                  <div>
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input
                      id="roomId"
                      type="text"
                      value={form.roomId}
                      onChange={(e) => handleChange("roomId", e.target.value)}
                      placeholder="Enter your room ID (optional)"
                    />
                    {errors.roomId && <div className="text-red-500 text-xs">{errors.roomId}</div>}
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={form.role} onValueChange={(value: 'admin' | 'student') => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <div className="text-red-500 text-xs">{errors.role}</div>}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">Thank you for registering!</p>
              <p>A verification email has been sent to <span className="font-semibold">{form.email}</span>. Please click the link in the email to activate your account.</p>
              <Button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resending...' : 'Resend Verification Email'}
              </Button>
              <Button
                variant="link"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 