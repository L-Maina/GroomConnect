'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Check,
  X,
  Eye,
  Ban,
} from 'lucide-react';
import { 
  GlassCard, 
  GlassButton, 
  GlassBadge,
  FadeIn,
} from '@/components/ui/custom/glass-components';
import type { User } from '@/types';

interface AdminDashboardProps {
  user: User | null;
  onNavigate?: (page: string) => void;
}

type DashboardTab = 'overview' | 'users' | 'businesses' | 'bookings' | 'revenue' | 'reports';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'businesses', label: 'Businesses', icon: Store },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
  ];

  // Admin stats
  const stats = [
    { label: 'Total Users', value: '5,234', change: '+156', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Businesses', value: '892', change: '+23', icon: Store, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Bookings', value: '12,456', change: '+892', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { label: 'Revenue', value: '$145,230', change: '+$12,450', icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
  ];

  // Sample pending businesses
  const pendingBusinesses = [
    { id: '1', name: 'New Style Studio', owner: 'John Smith', submitted: '2 days ago', city: 'Nairobi' },
    { id: '2', name: 'Glamour Nails', owner: 'Sarah Johnson', submitted: '3 days ago', city: 'Mombasa' },
    { id: '3', name: 'The Barber Den', owner: 'Mike Brown', submitted: '5 days ago', city: 'Kisumu' },
  ];

  // Sample users
  const sampleUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER', status: 'Active', bookings: 12 },
    { id: '2', name: 'Sarah Smith', email: 'sarah@example.com', role: 'BUSINESS_OWNER', status: 'Active', business: 'Elite Cuts' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'CUSTOMER', status: 'Inactive', bookings: 3 },
  ];

  // Sample reports
  const sampleReports = [
    { id: '1', type: 'Business', target: 'Quick Cuts', reporter: 'Jane D.', reason: 'Inappropriate content', status: 'Pending' },
    { id: '2', type: 'User', target: 'User123', reporter: 'Business A', reason: 'No-show multiple times', status: 'Resolved' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Manage users, businesses, and platform operations
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <FadeIn delay={0.1}>
            <GlassCard variant="default" className="p-4 h-fit lg:sticky lg:top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as DashboardTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'gradient-bg text-white'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.id === 'reports' && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        1
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </GlassCard>
          </FadeIn>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <FadeIn key={stat.label} delay={0.1 * (index + 1)}>
                      <GlassCard variant="default" className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </GlassCard>
                    </FadeIn>
                  ))}
                </div>

                {/* Pending Verifications */}
                <FadeIn delay={0.3}>
                  <GlassCard variant="default" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Pending Business Verifications</h3>
                      <GlassBadge variant="warning">3 pending</GlassBadge>
                    </div>
                    <div className="space-y-3">
                      {pendingBusinesses.map((business) => (
                        <div key={business.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-medium">
                              {business.name[0]}
                            </div>
                            <div>
                              <div className="font-medium">{business.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {business.owner} • {business.city} • {business.submitted}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <GlassButton variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                              Review
                            </GlassButton>
                            <GlassButton variant="default" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700">
                              <Check className="h-4 w-4" />
                            </GlassButton>
                            <GlassButton variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <X className="h-4 w-4" />
                            </GlassButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </FadeIn>

                {/* Quick Stats */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FadeIn delay={0.4}>
                    <GlassCard variant="default" className="p-6">
                      <h3 className="font-semibold mb-4">Platform Health</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Active Users</span>
                          <span className="font-medium">4,892</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Active Businesses</span>
                          <span className="font-medium">756</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Avg. Response Time</span>
                          <span className="font-medium">2.4 hrs</span>
                        </div>
                      </div>
                    </GlassCard>
                  </FadeIn>

                  <FadeIn delay={0.5}>
                    <GlassCard variant="default" className="p-6">
                      <h3 className="font-semibold mb-4">Today's Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">New Users</span>
                          <span className="font-medium">+45</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">New Bookings</span>
                          <span className="font-medium">+234</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-medium">$4,567</span>
                        </div>
                      </div>
                    </GlassCard>
                  </FadeIn>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <FadeIn>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <div className="flex gap-2">
                      <select className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
                        <option>All Roles</option>
                        <option>Customers</option>
                        <option>Business Owners</option>
                        <option>Admins</option>
                      </select>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.1}>
                  <GlassCard variant="default" className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 text-sm font-medium">User</th>
                            <th className="text-left p-4 text-sm font-medium">Role</th>
                            <th className="text-left p-4 text-sm font-medium">Status</th>
                            <th className="text-left p-4 text-sm font-medium">Activity</th>
                            <th className="text-left p-4 text-sm font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleUsers.map((user) => (
                            <tr key={user.id} className="border-t border-border">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-medium">
                                    {user.name[0]}
                                  </div>
                                  <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <GlassBadge variant={user.role === 'BUSINESS_OWNER' ? 'primary' : 'default'}>
                                  {user.role.replace('_', ' ')}
                                </GlassBadge>
                              </td>
                              <td className="p-4">
                                <GlassBadge variant={user.status === 'Active' ? 'success' : 'warning'}>
                                  {user.status}
                                </GlassBadge>
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {user.bookings ? `${user.bookings} bookings` : user.business}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <GlassButton variant="ghost" size="sm">View</GlassButton>
                                  <GlassButton variant="ghost" size="sm" className="text-destructive">
                                    <Ban className="h-4 w-4" />
                                  </GlassButton>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </FadeIn>
              </div>
            )}

            {/* Businesses Tab */}
            {activeTab === 'businesses' && (
              <div className="space-y-4">
                <FadeIn>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Businesses</h2>
                    <div className="flex gap-2">
                      <select className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
                        <option>All Status</option>
                        <option>Approved</option>
                        <option>Pending</option>
                        <option>Suspended</option>
                      </select>
                    </div>
                  </div>
                </FadeIn>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Elite Cuts & Style', city: 'Nairobi', rating: 4.9, status: 'Approved', plan: 'Featured' },
                    { name: 'Glamour Studio', city: 'Mombasa', rating: 4.8, status: 'Approved', plan: 'Premium' },
                    { name: 'New Style Studio', city: 'Nairobi', rating: 0, status: 'Pending', plan: 'Free' },
                  ].map((business, index) => (
                    <FadeIn key={business.name} delay={0.1 * (index + 1)}>
                      <GlassCard variant="default" className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{business.name}</h3>
                            <p className="text-sm text-muted-foreground">{business.city}</p>
                          </div>
                          <GlassBadge variant={business.status === 'Approved' ? 'success' : 'warning'}>
                            {business.status}
                          </GlassBadge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {business.rating > 0 ? `★ ${business.rating}` : 'No ratings'}
                          </span>
                          <GlassBadge variant="default">{business.plan}</GlassBadge>
                        </div>
                      </GlassCard>
                    </FadeIn>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <FadeIn>
                  <GlassCard variant="default" className="p-6">
                    <div className="text-center mb-6">
                      <p className="text-muted-foreground mb-2">Total Revenue</p>
                      <div className="text-4xl font-bold gradient-text">$145,230</div>
                      <p className="text-sm text-green-600 mt-1">+18% from last month</p>
                    </div>
                    <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground">
                      [Revenue Chart]
                    </div>
                  </GlassCard>
                </FadeIn>

                <FadeIn delay={0.1}>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <GlassCard variant="default" className="p-4 text-center">
                      <div className="text-2xl font-bold">$45,230</div>
                      <div className="text-sm text-muted-foreground">Stripe</div>
                    </GlassCard>
                    <GlassCard variant="default" className="p-4 text-center">
                      <div className="text-2xl font-bold">$65,000</div>
                      <div className="text-sm text-muted-foreground">PayPal</div>
                    </GlassCard>
                    <GlassCard variant="default" className="p-4 text-center">
                      <div className="text-2xl font-bold">$35,000</div>
                      <div className="text-sm text-muted-foreground">M-Pesa</div>
                    </GlassCard>
                  </div>
                </FadeIn>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <FadeIn>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Reports & Disputes</h2>
                    <select className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
                      <option>All Reports</option>
                      <option>Pending</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </FadeIn>

                {sampleReports.map((report, index) => (
                  <FadeIn key={report.id} delay={0.1 * (index + 1)}>
                    <GlassCard variant="default" className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            report.status === 'Pending' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                          }`}>
                            <AlertTriangle className={`h-5 w-5 ${
                              report.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium">{report.type}: {report.target}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Reported by {report.reporter} • {report.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <GlassBadge variant={report.status === 'Pending' ? 'warning' : 'success'}>
                            {report.status}
                          </GlassBadge>
                          <GlassButton variant="ghost" size="sm">Review</GlassButton>
                        </div>
                      </div>
                    </GlassCard>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
