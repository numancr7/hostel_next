"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [form, setForm] = useState<ForgotPasswordForm>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordForm, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (field: keyof ForgotPasswordForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = ForgotPasswordSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordForm, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof ForgotPasswordForm] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      // Check if the response is OK and has content before trying to parse as JSON
      const data = res.ok && res.headers.get('content-type')?.includes('application/json') 
                   ? await res.json() 
                   : {}; // Default to empty object if no JSON content or not OK
      setIsLoading(false);

      if (res.ok) {
        // Use a clearer message to guide the user to check their email
        toast({
          title: "Password Reset Link Sent",
          description: "A password reset link has been sent to your email address. Please check your inbox (and spam folder) to continue.",
        });
        setForm({ email: "" }); // Clear the form
        // Redirect user to a verification info page after successful submission
        router.push('/forgot-password/verify');
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed to send password reset link. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Forgot Your Password?</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                placeholder="your@example.com"
              />
              {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          {message && (
            <div className={`mt-4 text-center ${message.includes("Error") || message.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </div>
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

              