'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import DashboardLayout from '@/components/dashboard-layout'
import { formatDistanceToNow } from 'date-fns'
import {
  Users,
  FileText,
  Brain,
  TrendingUp,
  Search,
  MoreHorizontal,
  Ban,
  Crown,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminStats {
  totalUsers: number
  totalStudyPacks: number
  processingPacks: number
  totalNotes: number
  revenueThisMonth: number
  activeSubscriptions: number
}

interface AdminUser {
  id: string
  email: string
  name?: string
  subscriptionTier: string
  studyPacksCount: number
  notesCount: number
  joinedAt: string
  lastActive?: string
  status: 'active' | 'banned'
}

interface PaymentProof {
  id: string
  userId: string
  planRequested: string
  screenshotUrl: string
  amount: string
  referenceNumber?: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  createdAt: string
  clerkUser: {
    firstName: string
    lastName: string
    email: string
    imageUrl?: string
  }
}

export default function AdminPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudyPacks: 0,
    processingPacks: 0,
    totalNotes: 0,
    revenueThisMonth: 0,
    activeSubscriptions: 0
  })
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users')
  const [loading, setLoading] = useState(true)

  // Check if user is admin (simple email check for MVP)
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress?.includes('admin') || false

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData()
      fetchPaymentProofs()
    }
  }, [isAdmin])

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim()) {
      const filtered = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchAdminData = async () => {
    try {
      // TODO: Implement actual API calls
      // For MVP, showing mock data
      setStats({
        totalUsers: 1247,
        totalStudyPacks: 3891,
        processingPacks: 23,
        totalNotes: 8942,
        revenueThisMonth: 18650,
        activeSubscriptions: 156
      })

      // Mock users data
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          email: 'john.doe@email.com',
          name: 'John Doe',
          subscriptionTier: 'pro',
          studyPacksCount: 15,
          notesCount: 48,
          joinedAt: '2024-01-15',
          lastActive: '2024-01-20',
          status: 'active'
        },
        {
          id: '2',
          email: 'jane.smith@email.com',
          name: 'Jane Smith',
          subscriptionTier: 'free',
          studyPacksCount: 3,
          notesCount: 12,
          joinedAt: '2024-01-18',
          lastActive: '2024-01-19',
          status: 'active'
        },
        // Add more mock users...
      ]

      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentProofs = async () => {
    try {
      const response = await fetch('/api/admin/payment-proofs?status=pending')
      if (response.ok) {
        const proofs = await response.json()
        setPaymentProofs(proofs)
      }
    } catch (error) {
      console.error('Error fetching payment proofs:', error)
      toast.error('Failed to load payment proofs')
    }
  }

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'upgrade') => {
    try {
      // TODO: Implement actual API calls
      toast.success(`User ${action} action completed`)
      // Refresh data
      fetchAdminData()
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  const handlePaymentAction = async (paymentProofId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/payment-proofs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentProofId,
          action,
          adminNotes
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} payment`)
      }

      toast.success(`Payment ${action}ed successfully`)
      fetchPaymentProofs() // Refresh payment proofs
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error)
      toast.error(`Failed to ${action} payment`)
    }
  }

  if (!isAdmin) {
    return (
      <DashboardLayout title="Access Denied">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Manage users, monitor system health, and view analytics"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Packs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudyPacks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.processingPacks} currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Monthly)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats.revenueThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeSubscriptions} active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processingPacks}</div>
              <p className="text-xs text-muted-foreground">
                Files being processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                User-generated content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">
                Uptime this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4 mr-2 inline" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'payments'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="h-4 w-4 mr-2 inline" />
            Payment Approvals
            {paymentProofs.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {paymentProofs.length}
              </Badge>
            )}
          </button>
        </div>

        {/* User Management */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, subscriptions, and access
              </CardDescription>
            </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                Export Users
              </Button>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Subscription</th>
                      <th className="text-left p-4 font-medium">Usage</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{user.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={
                              user.subscriptionTier === 'free'
                                ? 'bg-gray-100 text-gray-800'
                                : user.subscriptionTier === 'pro'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }
                          >
                            {user.subscriptionTier.toUpperCase()}
                            {user.subscriptionTier !== 'free' && (
                              <Crown className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{user.studyPacksCount} study packs</div>
                            <div className="text-muted-foreground">{user.notesCount} notes</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{new Date(user.joinedAt).toLocaleDateString()}</div>
                            {user.lastActive && (
                              <div className="text-muted-foreground">
                                Active {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {user.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'ban')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Ban
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'unban')}
                              >
                                Unban
                              </Button>
                            )}
                            {user.subscriptionTier === 'free' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'upgrade')}
                              >
                                <Crown className="h-3 w-3 mr-1" />
                                Upgrade
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Payment Approvals */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Approvals</CardTitle>
              <CardDescription>
                Review and approve GCash payment proofs for subscription upgrades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentProofs.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Payments</h3>
                  <p className="text-muted-foreground">
                    All payment proofs have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentProofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="border rounded-lg p-6 bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {proof.clerkUser.imageUrl ? (
                            <img
                              src={proof.clerkUser.imageUrl}
                              alt="User"
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {proof.clerkUser.firstName} {proof.clerkUser.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {proof.clerkUser.email}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                {proof.planRequested.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{proof.amount}</span>
                              {proof.referenceNumber && (
                                <span className="text-muted-foreground">
                                  Ref: {proof.referenceNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted {formatDistanceToNow(new Date(proof.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(proof.screenshotUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Proof
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentAction(proof.id, 'reject', 'Please resubmit with clearer image or correct amount')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePaymentAction(proof.id, 'approve', 'Payment verified and approved')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Export Users</span>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">System Logs</span>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col">
                <Brain className="h-6 w-6 mb-2" />
                <span className="text-sm">AI Status</span>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}