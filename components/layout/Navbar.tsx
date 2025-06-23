"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Handle logout with NextAuth
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  // Show spinner while session is loading
  if (status === "loading") {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="min-h-[4rem] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gray-900">HostelMS</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-gray-700 hover:text-primary font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary font-medium">
              Contact
            </Link>
          </div>

          {/* User Info and Logout (Desktop) */}
          {session?.user && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{session.user.name}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {session.user.role}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}

          {/* Hamburger Icon for Mobile */}
          <button
            className="md:hidden p-2 rounded focus:outline-none"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Menu - Centered */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col items-center space-y-4 mt-4">
              <Link
                href="/about"
                className="text-gray-700 hover:text-primary font-medium text-center w-full py-2"
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-primary font-medium text-center w-full py-2"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>
              {session?.user && (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{session.user.name}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {session.user.role}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full max-w-[200px]"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};