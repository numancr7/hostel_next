"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof ContactSchema>;

const Contact: React.FC = () => {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = ContactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof ContactForm] = err.message;
      });
      setErrors(fieldErrors);
      setSuccess(null);
      return;
    }
    setSuccess("Thank you for contacting us! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
    setErrors({});
  };

  return (
    <section className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4 text-primary">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={e => handleChange("name", e.target.value)} />
          {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Input id="message" value={form.message} onChange={e => handleChange("message", e.target.value)} />
          {errors.message && <div className="text-red-500 text-xs">{errors.message}</div>}
        </div>
        <Button type="submit">Send</Button>
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
    </section>
  );
};

export default Contact;
