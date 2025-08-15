'use client'

import { useState } from 'react'
import { ChevronRight, Users, MessageSquare, CreditCard, Settings } from 'lucide-react'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('members')

    const handleMemberUpdate = (memberId: string, updates: any) => {
        console.log('Updating member:', memberId, updates)
        // Mock implementation
    }

    const handleBulkOperation = (operation: string, selectedIds: string[]) => {
        console.log('Bulk operation:', operation, selectedIds)
        // Mock implementation
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header - Luxury & Commanding */}
            <section className="luxury-section-lg bg-neutral-50">
                <div className="luxury-container text-center">
                    <div className="animate-fade-up">
                        <h1 className="hero-text mb-8 text-neutral-900">
                            Admin Dashboard
                        </h1>
                        <p className="subtitle-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                            Manage your exclusive yacht club membership with precision and sophistication. 
                            Monitor members, handle support requests, and maintain the highest standards of service.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Dashboard Content */}
            <section className="luxury-section">
                <div className="luxury-container">
                    
                    {/* Tab Navigation - Elegant & Refined */}
                    <div className="mb-16">
                        <div className="flex items-center justify-center space-x-1 bg-neutral-100 p-2 rounded-lg max-w-2xl mx-auto">
                            {[
                                { id: 'members', label: 'Member Management', icon: Users },
                                { id: 'support', label: 'Support Tickets', icon: MessageSquare },
                                { id: 'refunds', label: 'Refund Process', icon: CreditCard },
                                { id: 'settings', label: 'Settings', icon: Settings }
                            ].map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-3 px-6 py-4 rounded-md transition-all duration-200 font-light ${
                                            activeTab === tab.id
                                                ? 'bg-white text-neutral-900 shadow-subtle'
                                                : 'text-neutral-600 hover:text-neutral-800'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm uppercase tracking-wider">{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tab Content - Sophisticated Layout */}
                    <div className="animate-fade-in">
                        
                        {/* Member Management Tab */}
                        {activeTab === 'members' && (
                            <div className="space-y-16">
                                <div className="text-center mb-16">
                                    <h2 className="title-text mb-8 text-neutral-800">Member Management</h2>
                                    <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                        Oversee your exclusive membership base with precision and care. 
                                        Monitor status, manage NFC cards, and ensure every member receives exceptional service.
                                    </p>
                                </div>

                                {/* Member Stats - Elegant Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">24</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Total Members</div>
                                    </div>
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">18</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Active Members</div>
                                    </div>
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">6</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Pending NFC Cards</div>
                                    </div>
                                </div>

                                {/* Member List - Refined Table */}
                                <div className="border border-neutral-200 bg-white">
                                    <div className="p-8 border-b border-neutral-200">
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Recent Members</h3>
                                        <p className="text-sm text-neutral-500">Manage your exclusive membership base</p>
                                    </div>
                                    
                                    <div className="divide-y divide-neutral-200">
                                        {[
                                            { id: '1', name: 'John Smith', email: 'john@example.com', tier: 'Standard', status: 'Active', nfcStatus: 'Linked' },
                                            { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', tier: 'Premium', status: 'Active', nfcStatus: 'Pending' },
                                            { id: '3', name: 'Michael Brown', email: 'michael@example.com', tier: 'Standard', status: 'Active', nfcStatus: 'Linked' }
                                        ].map((member) => (
                                            <div key={member.id} className="p-8 flex items-center justify-between hover:bg-neutral-50 transition-colors duration-200">
                                                <div className="space-y-2">
                                                    <div className="font-light text-neutral-900 text-lg">{member.name}</div>
                                                    <div className="text-sm text-neutral-500">{member.email}</div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="luxury-badge">{member.tier}</span>
                                                        <span className={`text-sm ${member.status === 'Active' ? 'text-neutral-600' : 'text-neutral-500'}`}>
                                                            {member.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-2">
                                                    <div className="text-sm text-neutral-500">NFC Status</div>
                                                    <span className={`text-sm ${member.nfcStatus === 'Linked' ? 'text-neutral-600' : 'text-neutral-500'}`}>
                                                        {member.nfcStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Support Tickets Tab */}
                        {activeTab === 'support' && (
                            <div className="space-y-16">
                                <div className="text-center mb-16">
                                    <h2 className="title-text mb-8 text-neutral-800">Support Tickets</h2>
                                    <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                        Provide exceptional support to your valued members. 
                                        Address concerns promptly and maintain the highest standards of service excellence.
                                    </p>
                                </div>

                                {/* Ticket Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">8</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Open Tickets</div>
                                    </div>
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">12</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Resolved Today</div>
                                    </div>
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">2.4h</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Avg Response Time</div>
                                    </div>
                                </div>

                                {/* Ticket List */}
                                <div className="border border-neutral-200 bg-white">
                                    <div className="p-8 border-b border-neutral-200">
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Recent Support Requests</h3>
                                        <p className="text-sm text-neutral-500">Address member concerns with care and precision</p>
                                    </div>
                                    
                                    <div className="divide-y divide-neutral-200">
                                        {[
                                            { id: '1', member: 'John Smith', subject: 'NFC Card Not Working', priority: 'High', status: 'Open' },
                                            { id: '2', member: 'Sarah Johnson', subject: 'Membership Benefits Question', priority: 'Medium', status: 'In Progress' },
                                            { id: '3', member: 'Michael Brown', subject: 'Event Registration Issue', priority: 'Low', status: 'Resolved' }
                                        ].map((ticket) => (
                                            <div key={ticket.id} className="p-8 flex items-center justify-between hover:bg-neutral-50 transition-colors duration-200">
                                                <div className="space-y-2">
                                                    <div className="font-light text-neutral-900 text-lg">{ticket.subject}</div>
                                                    <div className="text-sm text-neutral-500">From: {ticket.member}</div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`luxury-badge ${
                                                            ticket.priority === 'High' ? 'border-red-200 text-red-700' : 
                                                            ticket.priority === 'Medium' ? 'border-yellow-200 text-yellow-700' : 
                                                            'border-green-200 text-green-700'
                                                        }`}>
                                                            {ticket.priority}
                                                        </span>
                                                        <span className={`text-sm ${
                                                            ticket.status === 'Open' ? 'text-neutral-600' : 
                                                            ticket.status === 'In Progress' ? 'text-neutral-600' : 
                                                            'text-neutral-500'
                                                        }`}>
                                                            {ticket.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button className="luxury-button-text focus-ring">
                                                    View Details
                                                    <ChevronRight className="h-4 w-4 ml-2" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Refund Process Tab */}
                        {activeTab === 'refunds' && (
                            <div className="space-y-16">
                                <div className="text-center mb-16">
                                    <h2 className="title-text mb-8 text-neutral-800">Refund Process</h2>
                                    <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                        Handle refund requests with professionalism and care. 
                                        Ensure every member receives fair and timely resolution to their concerns.
                                    </p>
                                </div>

                                {/* Refund Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">3</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Pending Requests</div>
                                    </div>
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">15</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Processed This Month</div>
                                    </div>
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="text-3xl font-light text-neutral-900 mb-2">24h</div>
                                        <div className="text-sm text-neutral-500 uppercase tracking-wider">Avg Processing Time</div>
                                    </div>
                                </div>

                                {/* Refund List */}
                                <div className="border border-neutral-200 bg-white">
                                    <div className="p-8 border-b border-neutral-200">
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Refund Requests</h3>
                                        <p className="text-sm text-neutral-500">Process refunds with care and attention to detail</p>
                                    </div>
                                    
                                    <div className="divide-y divide-neutral-200">
                                        {[
                                            { id: '1', member: 'John Smith', amount: '$150', reason: 'Service not as expected', status: 'Under Review' },
                                            { id: '2', member: 'Sarah Johnson', amount: '$150', reason: 'Technical difficulties', status: 'Approved' },
                                            { id: '3', member: 'Michael Brown', amount: '$150', reason: 'Change of plans', status: 'Denied' }
                                        ].map((refund) => (
                                            <div key={refund.id} className="p-8 flex items-center justify-between hover:bg-neutral-50 transition-colors duration-200">
                                                <div className="space-y-2">
                                                    <div className="font-light text-neutral-900 text-lg">${refund.amount}</div>
                                                    <div className="text-sm text-neutral-500">From: {refund.member}</div>
                                                    <div className="text-sm text-neutral-600">{refund.reason}</div>
                                                    <span className={`text-sm ${
                                                        refund.status === 'Under Review' ? 'text-neutral-600' : 
                                                        refund.status === 'Approved' ? 'text-neutral-600' : 
                                                        'text-neutral-500'
                                                    }`}>
                                                        Status: {refund.status}
                                                    </span>
                                                </div>
                                                <button className="luxury-button-text focus-ring">
                                                    Process
                                                    <ChevronRight className="h-4 w-4 ml-2" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-16">
                                <div className="text-center mb-16">
                                    <h2 className="title-text mb-8 text-neutral-800">System Settings</h2>
                                    <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                        Configure your yacht club management system with precision. 
                                        Maintain security, customize features, and ensure optimal performance.
                                    </p>
                                </div>

                                {/* Settings Categories */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="border border-neutral-200 bg-white p-8">
                                        <h3 className="text-xl font-light text-neutral-800 mb-6">Security Settings</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-600">Two-Factor Authentication</span>
                                                <button className="luxury-button-text text-xs">Enable</button>
                                            </div>
                                            <div className="luxury-divider"></div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-600">Session Timeout</span>
                                                <span className="text-sm text-neutral-500">30 minutes</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-neutral-200 bg-white p-8">
                                        <h3 className="text-xl font-light text-neutral-800 mb-6">Notification Preferences</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-600">Email Notifications</span>
                                                <button className="luxury-button-text text-xs">Configure</button>
                                            </div>
                                            <div className="luxury-divider"></div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-600">SMS Alerts</span>
                                                <button className="luxury-button-text text-xs">Configure</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}