// components/PurchaseMembership.tsx
'use client'

import { useState } from 'react'
import { usePrivyAuth } from '@/hooks/usePrivyAuth'

export function PurchaseMembership() {
  const {
    authenticated,
    ready,
    isLoading,
    activeWallet,
    login,
    checkAuthState
  } = usePrivyAuth()
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    try {
      setPurchaseLoading(true)
      setError(null)

      // This will throw appropriate errors if auth state is invalid
      const { user, wallet } = checkAuthState()

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          userEmail: user.email?.address,
          // other checkout data
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Purchase error:', err)
    } finally {
      setPurchaseLoading(false)
    }
  }

  if (!ready || isLoading) {
    return <div>Loading...</div>
  }

  if (!authenticated) {
    return (
      <button
        onClick={() => login()}
        className="btn btn-primary"
      >
        Login to Purchase
      </button>
    )
  }

  if (!activeWallet?.address) {
    return (
      <button
        onClick={() => login()}
        className="btn btn-primary"
      >
        Connect Wallet to Purchase
      </button>
    )
  }

  return (
    <div>
      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handlePurchase}
        disabled={purchaseLoading}
        className="btn btn-primary"
      >
        {purchaseLoading ? 'Processing...' : 'Purchase Membership'}
      </button>
    </div>
  )
}