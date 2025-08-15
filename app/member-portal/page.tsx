'use client'

import { useState } from 'react'
import { ChevronRight, Download, Copy, CheckCircle, Clock, User, CreditCard, Settings, MessageSquare } from 'lucide-react'

export default function MemberPortal() {
    const [activeTab, setActiveTab] = useState('overview')
    const [copied, setCopied] = useState<string | null>(null)

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text)
        setCopied(type)
        setTimeout(() => setCopied(null), 2000)
    }

    const downloadNFCData = () => {
        const data = {
            cardId: "NFC-001-2024",
            serialNumber: "SN-2024-001",
            memberId: "LSYC-001",
            tier: "Standard"
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'nfc-card-data.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const downloadQRCode = () => {
        // Mock QR code download
        console.log('Downloading QR code...')
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header - Luxury & Commanding */}
            <section className="luxury-section-lg bg-neutral-50">
                <div className="luxury-container text-center">
                    <div className="animate-fade-up">
                        <h1 className="hero-text mb-8 text-neutral-900">
                            Member Portal
                        </h1>
                        <p className="subtitle-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                            Welcome to your exclusive yacht club experience. Access your membership details, 
                            manage NFC cards, and enjoy the privileges of your premium status.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Portal Content */}
            <section className="luxury-section">
                <div className="luxury-container">
                    
                    {/* Tab Navigation - Elegant & Refined */}
                    <div className="mb-16">
                        <div className="flex items-center justify-center space-x-1 bg-neutral-100 p-2 rounded-lg max-w-2xl mx-auto">
                            {[
                                { id: 'overview', label: 'Overview', icon: User },
                                { id: 'nfc-cards', label: 'NFC Cards', icon: CreditCard },
                                { id: 'support', label: 'Support', icon: Settings }
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
                        
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-16">
                                <div className="text-center mb-16">
                                    <h2 className="title-text mb-8 text-neutral-800">Membership Overview</h2>
                                    <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                        Your exclusive yacht club membership details and current status
                                    </p>
                                </div>

                                {/* Membership Status - Elegant Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                    <div className="p-8 border border-neutral-200 bg-white">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-3 h-3 bg-neutral-600 rounded-full"></div>
                                            <span className="text-lg font-light text-neutral-800">Membership Status</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Status</span>
                                                <span className="luxury-status luxury-status-success">Active</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Tier</span>
                                                <span className="text-neutral-700 font-light">Standard</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Member Since</span>
                                                <span className="text-neutral-700 font-light">January 2024</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 border border-neutral-200 bg-white">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-3 h-3 bg-neutral-600 rounded-full"></div>
                                            <span className="text-lg font-light text-neutral-800">NFC Card Status</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Status</span>
                                                <span className="luxury-status luxury-status-success">Linked</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Card Type</span>
                                                <span className="text-neutral-700 font-light">Standard</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Linked Date</span>
                                                <span className="text-neutral-700 font-light">Jan 15, 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Member Benefits - Sophisticated List */}
                                <div className="border border-neutral-200 bg-white">
                                    <div className="p-8 border-b border-neutral-200">
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Your Benefits</h3>
                                        <p className="text-sm text-neutral-500">Exclusive privileges included with your membership</p>
                                    </div>
                                    
                                    <div className="divide-y divide-neutral-200">
                                        {[
                                            { benefit: 'Access to Premium Facilities', status: 'Active', icon: CheckCircle },
                                            { benefit: 'Exclusive Event Invitations', status: 'Active', icon: CheckCircle },
                                            { benefit: 'NFC Card Access Control', status: 'Active', icon: CheckCircle },
                                            { benefit: 'Priority Customer Support', status: 'Active', icon: CheckCircle },
                                            { benefit: 'Premium Tier Upgrade', status: 'Available', icon: Clock }
                                        ].map((item, index) => {
                                            const Icon = item.icon
                                            return (
                                                <div key={index} className="p-8 flex items-center justify-between hover:bg-neutral-50 transition-colors duration-200">
                                                    <div className="flex items-center space-x-4">
                                                        <Icon className={`h-5 w-5 ${
                                                            item.status === 'Active' ? 'text-neutral-600' : 'text-neutral-400'
                                                        }`} />
                                                        <span className="font-light text-neutral-900">{item.benefit}</span>
                                                    </div>
                                                    <span className={`text-sm ${
                                                        item.status === 'Active' ? 'text-neutral-600' : 'text-neutral-500'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NFC Cards Tab */}
                        {activeTab === 'nfc-cards' && (
                            <div className="space-y-16">
                                <div className="text-center mb-16">
                                    <h2 className="title-text mb-8 text-neutral-800">NFC Card Management</h2>
                                    <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                        Manage your physical NFC cards and access control settings. 
                                        Download card data and QR codes for easy access.
                                    </p>
                                </div>

                                {/* NFC Card Details */}
                                <div className="border border-neutral-200 bg-white">
                                    <div className="p-8 border-b border-neutral-200">
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Card Information</h3>
                                        <p className="text-sm text-neutral-500">Your linked NFC card details and management options</p>
                                    </div>
                                    
                                    <div className="p-8 space-y-8">
                                        {/* Card Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-neutral-500 uppercase tracking-wider">Card ID</span>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="font-mono text-sm text-neutral-700">NFC-001-2024</span>
                                                        <button 
                                                            onClick={() => handleCopy('NFC-001-2024', 'cardId')}
                                                            className="luxury-button-text text-xs focus-ring"
                                                        >
                                                            {copied === 'cardId' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-neutral-500 uppercase tracking-wider">Serial Number</span>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="font-mono text-sm text-neutral-700">SN-2024-001</span>
                                                        <button 
                                                            onClick={() => handleCopy('SN-2024-001', 'serial')}
                                                            className="luxury-button-text text-xs focus-ring"
                                                        >
                                                            {copied === 'serial' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-neutral-500 uppercase tracking-wider">Card Type</span>
                                                    <span className="text-neutral-700 font-light">Standard</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-neutral-500 uppercase tracking-wider">Linked Date</span>
                                                    <span className="text-neutral-700 font-light">January 15, 2024</span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="p-6 border border-neutral-200 rounded-lg text-center">
                                                    <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                                        <CreditCard className="h-8 w-8 text-neutral-600" />
                                                    </div>
                                                    <p className="text-sm text-neutral-600 mb-4">Physical NFC Card</p>
                                                    <span className="luxury-status luxury-status-success">Active & Linked</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8 border-t border-neutral-200">
                                            <button 
                                                onClick={downloadNFCData}
                                                className="luxury-button-secondary focus-ring"
                                            >
                                                <Download className="h-5 w-5 mr-3" />
                                                Download Card Data
                                            </button>
                                            
                                            <button 
                                                onClick={downloadQRCode}
                                                className="luxury-button-secondary focus-ring"
                                            >
                                                <Download className="h-5 w-5 mr-3" />
                                                Download QR Code
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Support Tab */}
                        {activeTab === 'support' && (
                            <div className="space-y-16">
                                <div className="text-center mb-16">
                                    <h2 className="title-text mb-8 text-neutral-800">Support & Assistance</h2>
                                    <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                        Get the help you need with your membership. Our dedicated support team 
                                        is here to ensure your experience is nothing short of exceptional.
                                    </p>
                                </div>

                                {/* Support Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
                                            <MessageSquare className="h-8 w-8 text-neutral-600" />
                                        </div>
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Create Support Ticket</h3>
                                        <p className="text-sm text-neutral-600 mb-6">
                                            Submit a support request for any membership-related issues or questions.
                                        </p>
                                        <button className="luxury-button-primary focus-ring">
                                            Create Ticket
                                            <ChevronRight className="h-5 w-5 ml-3" />
                                        </button>
                                    </div>

                                    <div className="p-8 border border-neutral-200 bg-white text-center">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
                                            <CreditCard className="h-8 w-8 text-neutral-600" />
                                        </div>
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Request Refund</h3>
                                        <p className="text-sm text-neutral-600 mb-6">
                                            Submit a refund request if you're not satisfied with your membership.
                                        </p>
                                        <button className="luxury-button-secondary focus-ring">
                                            Request Refund
                                            <ChevronRight className="h-5 w-5 ml-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="border border-neutral-200 bg-white">
                                    <div className="p-8 border-b border-neutral-200">
                                        <h3 className="text-xl font-light text-neutral-800 mb-4">Contact Information</h3>
                                        <p className="text-sm text-neutral-500">Get in touch with our support team</p>
                                    </div>
                                    
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-500 uppercase tracking-wider">Email Support</span>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-neutral-700">support@lakestocktonyachtclub.com</span>
                                                <button 
                                                    onClick={() => handleCopy('support@lakestocktonyachtclub.com', 'email')}
                                                    className="luxury-button-text text-xs focus-ring"
                                                >
                                                    {copied === 'email' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="luxury-divider"></div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-500 uppercase tracking-wider">Phone Support</span>
                                            <span className="text-neutral-700">+1 (555) 123-4567</span>
                                        </div>
                                        
                                        <div className="luxury-divider"></div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-500 uppercase tracking-wider">Response Time</span>
                                            <span className="text-neutral-700">Within 24 hours</span>
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
