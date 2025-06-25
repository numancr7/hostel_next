"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified! You can now log in.",
      });
    }
    if (searchParams.get('reset') === 'true') {
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully! You can now log in with your new password.",
      });
    }
  }, [searchParams, toast]);

  // Handle login with NextAuth signIn
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Prevent signIn from redirecting itself
      });

      setIsLoading(false);

      if (result?.ok) {
        // Fetch session explicitly to get user role
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        const destination = sessionData?.user?.role === "admin" ? "/admin" : "/student";
        router.push(destination);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          title: "Login failed",
          description: result?.error || "Invalid email or password", // Use error from signIn result
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Unexpected login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign in to HostelMS</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="text-sm text-right">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-600 mb-2">Demo accounts:</p>
            <p className="text-xs">Admin: admin@hostel.com / admin123</p>
            <p className="text-xs">Student: student@hostel.com / student123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 