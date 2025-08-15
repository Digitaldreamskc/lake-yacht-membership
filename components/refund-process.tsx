'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Download,
  Send,
  RefreshCw
} from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

interface RefundRequest {
  id: string
  memberEmail: string
  memberWallet: string
  paymentIntentId: string
  amount: number
  currency: string
  reason: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'cancelled'
  category: 'duplicate_charge' | 'service_not_received' | 'quality_issue' | 'fraud' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  processedAt?: string
  adminNotes?: string
  refundAmount?: number
  stripeRefundId?: string
}

interface RefundProcessProps {
  isAdmin?: boolean
  className?: string
}

export function RefundProcess({ isAdmin = false, className }: RefundProcessProps) {
  const { user, authenticated } = usePrivy()
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null)
  const [newRequest, setNewRequest] = useState({
    reason: '',
    description: '',
    category: 'other' as const,
    priority: 'medium' as const
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [adminNotes, setAdminNotes] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock data for development
  useEffect(() => {
    const mockRequests: RefundRequest[] = [
      {
        id: '1',
        memberEmail: 'john@example.com',
        memberWallet: '0x1234...5678',
        paymentIntentId: 'pi_1234567890',
        amount: 15000, // $150.00 in cents
        currency: 'usd',
        reason: 'Duplicate charge',
        description: 'I was charged twice for my membership. The first charge went through successfully, but I was charged again immediately after.',
        status: 'pending',
        category: 'duplicate_charge',
        priority: 'urgent',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        memberEmail: 'sarah@example.com',
        memberWallet: '0x8765...4321',
        paymentIntentId: 'pi_0987654321',
        amount: 15000,
        currency: 'usd',
        reason: 'Service not received',
        description: 'I paid for Premium membership but I\'m still seeing Standard tier benefits. The upgrade hasn\'t been applied.',
        status: 'approved',
        category: 'service_not_received',
        priority: 'high',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        adminNotes: 'Verified issue. Member should receive Premium tier upgrade within 24 hours.',
        refundAmount: 15000
      },
      {
        id: '3',
        memberEmail: 'mike@example.com',
        memberWallet: '0x9999...8888',
        paymentIntentId: 'pi_1122334455',
        amount: 15000,
        currency: 'usd',
        reason: 'Quality issue',
        description: 'The NFC card I received is defective and doesn\'t work at any of the club entrances.',
        status: 'processed',
        category: 'quality_issue',
        priority: 'medium',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        adminNotes: 'Refund processed. New NFC card will be issued.',
        refundAmount: 15000,
        stripeRefundId: 're_1234567890'
      }
    ]
    setRefundRequests(mockRequests)
  }, [])

  const getStatusColor = (status: string): string => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800',
      'processed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-yellow-100 text-yellow-800',
      'urgent': 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'duplicate_charge': '💳',
      'service_not_received': '❌',
      'quality_issue': '🔧',
      'fraud': '🚨',
      'other': '❓'
    }
    return icons[category as keyof typeof icons] || '❓'
  }

  const getCategoryName = (category: string): string => {
    const names = {
      'duplicate_charge': 'Duplicate Charge',
      'service_not_received': 'Service Not Received',
      'quality_issue': 'Quality Issue',
      'fraud': 'Fraud',
      'other': 'Other'
    }
    return names[category as keyof typeof names] || 'Unknown'
  }

  const filteredRequests = refundRequests.filter(request => {
    const matchesSearch = 
      request.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.paymentIntentId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const createRefundRequest = async () => {
    if (!newRequest.reason || !newRequest.description) return

    const request: RefundRequest = {
      id: Date.now().toString(),
      memberEmail: user?.email?.address || 'Unknown',
      memberWallet: user?.wallet?.address || 'Unknown',
      paymentIntentId: 'pi_mock_' + Date.now(), // In real app, this would come from payment history
      amount: 15000, // Mock amount
      currency: 'usd',
      reason: newRequest.reason,
      description: newRequest.description,
      status: 'pending',
      category: newRequest.category,
      priority: newRequest.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setRefundRequests([request, ...refundRequests])
    setNewRequest({ reason: '', description: '', category: 'other', priority: 'medium' })
    setSelectedRequest(request)
  }

  const updateRequestStatus = async (requestId: string, newStatus: RefundRequest['status']) => {
    setRefundRequests(requests => 
      requests.map(r => 
        r.id === requestId 
          ? { 
              ...r, 
              status: newStatus, 
              updatedAt: new Date().toISOString(),
              processedAt: newStatus === 'processed' ? new Date().toISOString() : r.processedAt
            }
          : r
      )
    )
    
    if (selectedRequest?.id === requestId) {
      setSelectedRequest({ 
        ...selectedRequest, 
        status: newStatus, 
        updatedAt: new Date().toISOString(),
        processedAt: newStatus === 'processed' ? new Date().toISOString() : selectedRequest.processedAt
      })
    }
  }

  const processRefund = async () => {
    if (!selectedRequest || !refundAmount) return

    setLoading(true)
    try {
      // In real app, this would call Stripe API
      const stripeRefundId = 're_' + Date.now()
      
      const updatedRequest = {
        ...selectedRequest,
        status: 'processed' as const,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        refundAmount: parseFloat(refundAmount) * 100, // Convert to cents
        stripeRefundId,
        adminNotes: adminNotes || selectedRequest.adminNotes
      }

      setRefundRequests(requests => 
        requests.map(r => r.id === selectedRequest.id ? updatedRequest : r)
      )
      
      setSelectedRequest(updatedRequest)
      setRefundAmount('')
      setAdminNotes('')
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Failed to process refund:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100) // Convert from cents
  }

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  const exportRefundData = () => {
    const csvData = filteredRequests.map(request => ({
      'Request ID': request.id,
      'Member Email': request.memberEmail,
      'Payment Intent': request.paymentIntentId,
      'Amount': formatCurrency(request.amount, request.currency),
      'Reason': request.reason,
      'Category': getCategoryName(request.category),
      'Priority': request.priority,
      'Status': request.status,
      'Created': request.createdAt,
      'Updated': request.updatedAt
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `refund-requests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isAdmin ? 'Refund Request Management' : 'Request a Refund'}
        </h2>
        <p className="text-gray-600">
          {isAdmin 
            ? 'Review and process member refund requests'
            : 'Submit refund requests for payment issues or disputes'
          }
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">
            {isAdmin ? 'All Requests' : 'My Requests'}
          </TabsTrigger>
          <TabsTrigger value="new-request">
            {isAdmin ? 'Quick Actions' : 'Submit Request'}
          </TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Refund Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="duplicate_charge">Duplicate Charge</option>
                    <option value="service_not_received">Service Not Received</option>
                    <option value="quality_issue">Quality Issue</option>
                    <option value="fraud">Fraud</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="processed">Processed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              {isAdmin && (
                <div className="flex justify-end mb-4">
                  <Button variant="outline" onClick={exportRefundData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              )}

              {/* Requests List */}
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No refund requests found matching your criteria.
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <Card 
                      key={request.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">{getCategoryIcon(request.category)}</span>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{request.reason}</h3>
                                <p className="text-sm text-gray-600">
                                  {request.description.length > 100 
                                    ? `${request.description.substring(0, 100)}...` 
                                    : request.description
                                  }
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{request.memberEmail}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <CreditCard className="h-4 w-4" />
                                <span>{request.paymentIntentId}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatTimeAgo(request.createdAt)}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {formatCurrency(request.amount, request.currency)}
                              </div>
                              <div className="text-xs text-gray-500">Amount</div>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <Badge className={getPriorityColor(request.priority)}>
                                {request.priority}
                              </Badge>
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Request Tab */}
        <TabsContent value="new-request" className="mt-6">
          {!isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Submit Refund Request</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Reason for Refund</label>
                    <Input
                      placeholder="Brief reason for requesting a refund"
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Detailed Description</label>
                    <Textarea
                      placeholder="Please provide detailed information about why you need a refund..."
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={newRequest.category}
                        onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value as any })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="duplicate_charge">Duplicate Charge</option>
                        <option value="service_not_received">Service Not Received</option>
                        <option value="quality_issue">Quality Issue</option>
                        <option value="fraud">Fraud</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as any })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createRefundRequest}
                    disabled={!newRequest.reason || !newRequest.description}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Refund Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm">Refund Analytics</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📧</div>
                      <div className="text-sm">Bulk Processing</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📋</div>
                      <div className="text-sm">Export Reports</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <div className="text-2xl mb-2">⚙️</div>
                      <div className="text-sm">Settings</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Detail Sidebar */}
      {selectedRequest && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>{getCategoryIcon(selectedRequest.category)}</span>
                <span>{selectedRequest.reason}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Requested by {selectedRequest.memberEmail}</span>
              <span>•</span>
              <span>{formatTimeAgo(selectedRequest.createdAt)}</span>
              <span>•</span>
              <Badge className={getPriorityColor(selectedRequest.priority)}>
                {selectedRequest.priority}
              </Badge>
              <span>•</span>
              <Badge className={getStatusColor(selectedRequest.status)}>
                {selectedRequest.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <p className="text-sm text-gray-600">{getCategoryName(selectedRequest.category)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedRequest.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Payment Intent</label>
                      <p className="text-sm text-gray-600 font-mono">{selectedRequest.paymentIntentId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedRequest.amount, selectedRequest.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Currency</label>
                      <p className="text-sm text-gray-600">{selectedRequest.currency.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Controls */}
              {isAdmin && selectedRequest.status === 'pending' && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Process Refund</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Refund Amount (USD)</label>
                      <Input
                        type="number"
                        placeholder="150.00"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                      <Textarea
                        placeholder="Add notes about this refund decision..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                        variant="outline"
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={processRefund}
                        disabled={!refundAmount || loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <DollarSign className="h-4 w-4 mr-2" />
                        )}
                        Process Refund
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Updates */}
              {selectedRequest.status !== 'pending' && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Status Updates</h4>
                  <div className="space-y-3">
                    {selectedRequest.adminNotes && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-blue-900">Admin Notes</span>
                          <span className="text-xs text-blue-600">
                            {formatTimeAgo(selectedRequest.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">{selectedRequest.adminNotes}</p>
                      </div>
                    )}
                    
                    {selectedRequest.refundAmount && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-green-900">Refund Amount</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(selectedRequest.refundAmount, selectedRequest.currency)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {selectedRequest.stripeRefundId && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900">Stripe Refund ID</span>
                          <span className="text-sm text-gray-600 font-mono">
                            {selectedRequest.stripeRefundId}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



