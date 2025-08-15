'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export default function Home() {
    const [email, setEmail] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
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
        return <div>Loading...</div>
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                Welcome to LSYC
            </h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Purchase your $150 membership (NFT) in a few seconds.
            </p>

            {/* Privy Status */}
            <div style={{
                backgroundColor: authenticated ? '#f0f9ff' : '#fef3c7',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                {authenticated ? (
                    <div>
                        <p style={{ color: '#047857', fontWeight: 'bold' }}>✅ Connected</p>
                        <p style={{ fontSize: '14px', color: '#666' }}>
                            Email: {user?.email?.address}
                        </p>
                        <p style={{ fontSize: '14px', color: '#666', fontFamily: 'monospace' }}>
                            Wallet: {user?.wallet?.address ? `${user.wallet.address.slice(0, 8)}...` : 'Loading wallet...'}
                        </p>
                        <button
                            onClick={logout}
                            style={{
                                marginTop: '8px',
                                fontSize: '12px',
                                color: '#2563eb',
                                background: 'none',
                                border: 'none',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <div>
                        <p style={{ marginBottom: '12px', fontWeight: '500' }}>
                            Connect your wallet or email to continue
                        </p>
                        <button
                            onClick={handleLogin}
                            style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Connect Wallet/Email
                        </button>
                    </div>
                )}
            </div>

            {/* Form */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Email (optional - will use connected email if available)
                </label>
                <input
                    type="email"
                    value={email || user?.email?.address || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px'
                    }}
                    placeholder="you@example.com"
                />
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                }}>
                    {error}
                </div>
            )}

            <button
                onClick={handlePurchase}
                disabled={loading || !authenticated || !user?.wallet?.address}
                style={{
                    width: '100%',
                    backgroundColor: loading || !authenticated || !user?.wallet?.address ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loading || !authenticated || !user?.wallet?.address ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Processing...' : 'Purchase Membership — $150'}
            </button>

            {authenticated && !user?.wallet?.address && (
                <p style={{
                    fontSize: '12px',
                    color: '#d97706',
                    textAlign: 'center',
                    marginTop: '8px'
                }}>
                    Wallet is being set up... please wait a moment and try again.
                </p>
            )}

            {!authenticated && (
                <p style={{
                    fontSize: '12px',
                    color: '#d97706',
                    textAlign: 'center',
                    marginTop: '8px'
                }}>
                    Please connect your email above to continue
                </p>
            )}

            <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '12px' }}>
                After payment, you'll be redirected to the Success page while your NFT is minted.
            </p>

            {/* Real-World Interface Preview */}
            <div style={{
                marginTop: '32px',
                padding: '24px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
                    🚀 Experience the Future of Membership
                </h3>
                <p style={{ color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
                    Your NFT membership comes with a physical NFC card for real-world access. 
                    Experience seamless integration between digital and physical worlds.
                </p>
                <a 
                    href="/real-world"
                    style={{
                        display: 'inline-block',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                    Explore Real-World Interface →
                </a>
            </div>
        </div>
    )
}