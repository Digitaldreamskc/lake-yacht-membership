'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  User,
  Calendar,
  Tag,
  Send,
  Reply
} from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

interface SupportTicket {
  id: string
  title: string
  description: string
  category: 'technical' | 'billing' | 'membership' | 'nfc' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  memberEmail: string
  memberWallet: string
  createdAt: string
  updatedAt: string
  responses: TicketResponse[]
}

interface TicketResponse {
  id: string
  ticketId: string
  message: string
  isAdmin: boolean
  responderName: string
  createdAt: string
}

interface SupportTicketSystemProps {
  isAdmin?: boolean
  className?: string
}

export function SupportTicketSystem({ isAdmin = false, className }: SupportTicketSystemProps) {
  const { user, authenticated } = usePrivy()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [newResponse, setNewResponse] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock data for development
  useEffect(() => {
    const mockTickets: SupportTicket[] = [
      {
        id: '1',
        title: 'NFC Card Not Working',
        description: 'My NFC card is not being recognized at the club entrance. I tried multiple times but it keeps showing access denied.',
        category: 'nfc',
        priority: 'high',
        status: 'open',
        memberEmail: 'john@example.com',
        memberWallet: '0x1234...5678',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        responses: []
      },
      {
        id: '2',
        title: 'Membership Tier Upgrade Request',
        description: 'I would like to upgrade from Standard to Premium membership. How do I proceed with this?',
        category: 'membership',
        priority: 'medium',
        status: 'in-progress',
        memberEmail: 'sarah@example.com',
        memberWallet: '0x8765...4321',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        responses: [
          {
            id: 'resp1',
            ticketId: '2',
            message: 'Thank you for your request. I\'ve forwarded this to our membership team. They will contact you within 24 hours with upgrade options.',
            isAdmin: true,
            responderName: 'Support Team',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '3',
        title: 'Payment Issue - Double Charged',
        description: 'I was charged twice for my membership. Please help me get a refund for the duplicate charge.',
        category: 'billing',
        priority: 'urgent',
        status: 'open',
        memberEmail: 'mike@example.com',
        memberWallet: '0x9999...8888',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        responses: []
      }
    ]
    setTickets(mockTickets)
  }, [])

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-yellow-100 text-yellow-800',
      'urgent': 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string): string => {
    const colors = {
      'open': 'bg-red-100 text-red-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'technical': '🔧',
      'billing': '💳',
      'membership': '👤',
      'nfc': '📱',
      'general': '❓'
    }
    return icons[category as keyof typeof icons] || '❓'
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.memberEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const createTicket = async () => {
    if (!newTicket.title || !newTicket.description) return

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'open',
      memberEmail: user?.email?.address || 'Unknown',
      memberWallet: user?.wallet?.address || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: []
    }

    setTickets([ticket, ...tickets])
    setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' })
    setSelectedTicket(ticket)
  }

  const addResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return

    const response: TicketResponse = {
      id: Date.now().toString(),
      ticketId: selectedTicket.id,
      message: newResponse,
      isAdmin: isAdmin,
      responderName: isAdmin ? 'Support Team' : (user?.email?.address || 'Member'),
      createdAt: new Date().toISOString()
    }

    const updatedTicket = {
      ...selectedTicket,
      responses: [...selectedTicket.responses, response],
      status: isAdmin && selectedTicket.status === 'open' ? 'in-progress' : selectedTicket.status,
      updatedAt: new Date().toISOString()
    }

    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t))
    setSelectedTicket(updatedTicket)
    setNewResponse('')
  }

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(tickets.map(t => 
      t.id === ticketId 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ))
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date().toISOString() })
    }
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isAdmin ? 'Support Ticket Management' : 'Get Help & Support'}
        </h2>
        <p className="text-gray-600">
          {isAdmin 
            ? 'Manage member support requests and provide assistance'
            : 'Create support tickets for any issues or questions about your membership'
          }
        </p>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets">
            {isAdmin ? 'All Tickets' : 'My Tickets'}
          </TabsTrigger>
          <TabsTrigger value="new-ticket">
            {isAdmin ? 'Quick Actions' : 'Create Ticket'}
          </TabsTrigger>
        </TabsList>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Support Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search tickets..."
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
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="membership">Membership</option>
                    <option value="nfc">NFC</option>
                    <option value="general">General</option>
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
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
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

              {/* Tickets List */}
              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tickets found matching your criteria.
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <Card 
                      key={ticket.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                                <p className="text-sm text-gray-600">
                                  {ticket.description.length > 100 
                                    ? `${ticket.description.substring(0, 100)}...` 
                                    : ticket.description
                                  }
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{ticket.memberEmail}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatTimeAgo(ticket.createdAt)}</span>
                              </span>
                              {ticket.responses.length > 0 && (
                                <span className="flex items-center space-x-1">
                                  <Reply className="h-4 w-4" />
                                  <span>{ticket.responses.length} responses</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
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

        {/* New Ticket Tab */}
        <TabsContent value="new-ticket" className="mt-6">
          {!isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Support Ticket</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Please provide detailed information about your issue..."
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="membership">Membership</option>
                        <option value="nfc">NFC</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
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
                    onClick={createTicket}
                    disabled={!newTicket.title || !newTicket.description}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
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
                      <div className="text-sm">View Analytics</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📧</div>
                      <div className="text-sm">Bulk Response</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📋</div>
                      <div className="text-sm">Export Tickets</div>
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

      {/* Ticket Detail Sidebar */}
      {selectedTicket && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>{getCategoryIcon(selectedTicket.category)}</span>
                <span>{selectedTicket.title}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTicket(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Created by {selectedTicket.memberEmail}</span>
              <span>•</span>
              <span>{formatTimeAgo(selectedTicket.createdAt)}</span>
              <span>•</span>
              <Badge className={getPriorityColor(selectedTicket.priority)}>
                {selectedTicket.priority}
              </Badge>
              <span>•</span>
              <Badge className={getStatusColor(selectedTicket.status)}>
                {selectedTicket.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Ticket Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Admin Status Controls */}
              {isAdmin && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in-progress')}
                      disabled={selectedTicket.status === 'in-progress'}
                    >
                      Mark In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      disabled={selectedTicket.status === 'resolved'}
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                      disabled={selectedTicket.status === 'closed'}
                    >
                      Close Ticket
                    </Button>
                  </div>
                </div>
              )}

              {/* Responses */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Responses</h4>
                <div className="space-y-3">
                  {selectedTicket.responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-lg ${
                        response.isAdmin ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {response.responderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(response.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Response */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {isAdmin ? 'Add Response' : 'Add Comment'}
                </h4>
                <div className="space-y-3">
                  <Textarea
                    placeholder={isAdmin ? "Type your response..." : "Add a comment..."}
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={addResponse}
                    disabled={!newResponse.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isAdmin ? 'Send Response' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



