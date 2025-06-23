// types/next-auth.d.ts
// Type augmentation for NextAuth.js to match your app's User model (no image field)
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend NextAuth types to include id, role, and name (no image)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "student";
      name?: string;
      email?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    role: "admin" | "student";
    name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "student";
    name?: string;
    email?: string;
  }
}

// This file ensures TypeScript knows about your custom user/session fields for NextAuth. 