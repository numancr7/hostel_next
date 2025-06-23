"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Clock, DollarSign } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Hostel Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline hostel operations with our comprehensive management system. 
            Handle student registrations, room allocations, leave requests, and payments all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Efficiently manage student records, registrations, and profiles
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Home className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Room Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Smart room assignment system with capacity management
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Leave Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Handle leave requests with approval workflows
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Payment Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor dues, payments, and financial records
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try Demo Accounts
            </h2>
            <p className="text-gray-600">
              Explore the system with pre-configured demo accounts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Admin Account</CardTitle>
                <CardDescription>Full access to all management features</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2"><strong>Email:</strong> admin@hostel.com</p>
                <p className="text-sm mb-4"><strong>Password:</strong> admin123</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Manage student records</li>
                  <li>• Allocate rooms</li>
                  <li>• Review leave requests</li>
                  <li>• Track payments</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Student Account</CardTitle>
                <CardDescription>Student portal with personal dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2"><strong>Email:</strong> student@hostel.com</p>
                <p className="text-sm mb-4"><strong>Password:</strong> student123</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View room details</li>
                  <li>• Submit leave requests</li>
                  <li>• Check payment dues</li>
                  <li>• Update profile</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index; 