'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ChevronRight } from 'lucide-react'

export default function Home() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { ready, authenticated, user, login, logout } = usePrivy()

    const handleLogin = async () => {
        console.log('🔐 Login button clicked')
        console.log('📱 Privy ready state:', ready)
        console.log('🔑 Privy authenticated state:', authenticated)
        console.log('👤 Privy user state:', user)
        
        try {
            console.log('🚀 Calling Privy login...')
            await login()
            console.log('✅ Login call completed')
        } catch (error) {
            console.error('❌ Login error:', error)
        }
    }

    async function handlePurchase() {
        try {
            setLoading(true)
            setError(null)

            if (!email) throw new Error('Please enter your email.')

            // Get wallet address from Privy user object
            const userWalletAddress = user?.wallet?.address
            if (!userWalletAddress) throw new Error('No wallet found. Please reconnect your account.')

            const res = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: email,
                    walletAddress: userWalletAddress,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to create checkout session.')

            window.location.assign(data.url)
        } catch (e: any) {
            setError(e?.message || 'Something went wrong.')
            setLoading(false)
        }
    }

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center animate-fade-in">
                    <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mx-auto mb-8"></div>
                    <p className="text-lg text-neutral-600 font-light">Preparing your exclusive experience...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Luxury & Commanding */}
            <section className="luxury-section-xl flex items-center justify-center">
                <div className="luxury-container text-center">
                    <div className="animate-fade-up">
                        {/* Hero Headline - Bold & Commanding */}
                        <h1 className="hero-text mb-12 leading-tight">
                            Lake Stockton<br />
                            <span className="text-neutral-400">Yacht Club</span>
                        </h1>
                        
                        {/* Hero Subtitle - Refined & Exclusive */}
                        <p className="subtitle-text max-w-2xl mx-auto leading-relaxed mb-20 text-neutral-600 font-light">
                            Where digital innovation meets timeless luxury. Join an exclusive community 
                            that bridges the digital and physical worlds with unparalleled sophistication.
                        </p>
                        
                        {/* Hero CTA Button - Minimal & Elegant */}
                        <div className="animate-fade-up animate-delay-200">
                            <button 
                                onClick={handleLogin}
                                className="luxury-button-primary text-lg hover-lift focus-ring"
                            >
                                Begin Your Journey
                                <ChevronRight className="h-5 w-5 ml-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content - Single Column Luxury Layout */}
            <section className="luxury-section">
                <div className="luxury-container-narrow">
                    
                    {/* Membership Access Section - Elegant & Refined */}
                    <div className="mb-32">
                        <div className="text-center mb-20">
                            <h2 className="title-text mb-8">Membership Access</h2>
                            <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                Unlock exclusive benefits with your digital membership NFT, 
                                seamlessly integrated with physical access control.
                            </p>
                        </div>

                        {/* Wallet Connection Status - Sophisticated */}
                        <div className={`mb-20 p-12 border border-neutral-200 transition-all duration-500 ${
                            authenticated 
                                ? 'bg-neutral-50' 
                                : 'bg-neutral-50'
                        }`}>
                            {authenticated ? (
                                <div className="space-y-8">
                                    <div className="text-center mb-8">
                                        <div className="w-3 h-3 bg-neutral-600 rounded-full mx-auto mb-4"></div>
                                        <span className="text-lg text-neutral-800 font-light">Wallet Connected</span>
                                    </div>
                                    <div className="space-y-6 text-left max-w-md mx-auto">
                                        <div className="flex items-center justify-between text-neutral-700">
                                            <span className="text-sm text-neutral-500 uppercase tracking-wider">Email</span>
                                            <span className="font-light">{user?.email?.address}</span>
                                        </div>
                                        <div className="luxury-divider"></div>
                                        <div className="flex items-center justify-between text-neutral-700">
                                            <span className="text-sm text-neutral-500 uppercase tracking-wider">Wallet</span>
                                            <span className="font-light font-mono text-sm">
                                                {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Loading...'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center pt-6">
                                        <button
                                            onClick={logout}
                                            className="luxury-button-text focus-ring"
                                        >
                                            Disconnect Wallet
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-neutral-800 font-light mb-8 text-lg">Connect your wallet to continue</p>
                                    <button 
                                        onClick={handleLogin} 
                                        className="luxury-button-primary text-lg hover-lift focus-ring"
                                    >
                                        Connect Wallet
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Purchase Form - Refined & Minimal */}
                        {authenticated && (
                            <div className="space-y-12 animate-fade-in">
                                <div>
                                    <label className="block text-sm text-neutral-600 mb-6 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="luxury-input focus-ring"
                                    />
                                </div>
                                
                                {error && (
                                    <div className="p-8 border border-neutral-200 bg-neutral-50">
                                        <p className="text-neutral-700 text-sm">{error}</p>
                                    </div>
                                )}

                                <button 
                                    onClick={handlePurchase} 
                                    disabled={loading || !email}
                                    className="luxury-button-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed hover-lift focus-ring"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <>
                                            Purchase Membership — $150
                                            <ChevronRight className="h-5 w-5 ml-3" />
                                        </>
                                    )}
                                </button>
                                
                                {/* Premium Features - Elegant List */}
                                <div className="pt-12 border-t border-neutral-200">
                                    <p className="text-sm text-neutral-500 text-center mb-8 uppercase tracking-wider">Your membership includes</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-4">
                                            <span className="text-neutral-700">NFT Access</span>
                                            <div className="luxury-divider-accent"></div>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <span className="text-neutral-700">NFC Cards</span>
                                            <div className="luxury-divider-accent"></div>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <span className="text-neutral-700">Premium Events</span>
                                            <div className="luxury-divider-accent"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Premium Benefits Section - Sophisticated */}
                    <div className="mb-32">
                        <h2 className="title-text mb-20 text-center">Premium Benefits</h2>
                        
                        <div className="space-y-16">
                            <div className="text-center">
                                <h3 className="text-2xl font-light mb-6 text-neutral-800">Exclusive Access</h3>
                                <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                    Private events, member-only areas, and premium services designed for the discerning yacht enthusiast.
                                </p>
                            </div>
                            
                            <div className="luxury-divider"></div>
                            
                            <div className="text-center">
                                <h3 className="text-2xl font-light mb-6 text-neutral-800">NFC Technology</h3>
                                <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                    Physical NFC cards linked to your digital membership, providing seamless access to exclusive facilities.
                                </p>
                            </div>
                            
                            <div className="luxury-divider"></div>
                            
                            <div className="text-center">
                                <h3 className="text-2xl font-light mb-6 text-neutral-800">Elite Community</h3>
                                <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                                    Connect with fellow yacht enthusiasts and professionals in an environment of mutual respect and shared passion.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Membership Tiers - Refined */}
                    <div className="mb-32">
                        <h2 className="title-text mb-20 text-center">Membership Tiers</h2>
                        
                        <div className="space-y-8">
                            <div className="flex items-center justify-between py-8 border-b border-neutral-200">
                                <div>
                                    <span className="text-xl font-light text-neutral-800">Standard Membership</span>
                                    <p className="text-sm text-neutral-500 mt-2">Perfect for new members</p>
                                </div>
                                <span className="luxury-badge">$150</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-8 border-b border-neutral-200">
                                <div>
                                    <span className="text-xl font-light text-neutral-800">Premium Membership</span>
                                    <p className="text-sm text-neutral-500 mt-2">Enhanced benefits & priority access</p>
                                </div>
                                <span className="luxury-badge">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real-World Integration - Hero-Sized */}
            <section className="luxury-section-xl">
                <div className="luxury-container-narrow text-center">
                    <div className="animate-fade-up">
                        <h2 className="title-text mb-12 text-neutral-800">
                            Your Digital Identity,<br />
                            <span className="text-neutral-400">Perfected</span>
                        </h2>
                        
                        <p className="subtitle-text mb-16 max-w-3xl mx-auto text-neutral-600 leading-relaxed">
                            Your NFT membership isn't just digital - it's a bridge to the real world. 
                            Link physical NFC cards, access exclusive areas, and experience seamless verification 
                            that feels like magic.
                        </p>
                        
                        <div className="space-y-8 mb-16">
                            <div className="flex items-center justify-center space-x-12">
                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Instant Verification</span>
                                <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Secure Access</span>
                                <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Seamless Integration</span>
                            </div>
                        </div>
                        
                        <a 
                            href="/real-world"
                            className="luxury-button-primary inline-flex items-center text-xl hover-lift focus-ring"
                        >
                            Explore Real-World Interface
                            <ChevronRight className="h-6 w-6 ml-3" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}