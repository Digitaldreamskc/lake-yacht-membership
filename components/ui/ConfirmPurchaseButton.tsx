// components/ConfirmPurchaseButton.tsx
'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from '@/hooks/use-toast'

export function ConfirmPurchaseButton({ tier }: { tier: string }) {
  const { user } = usePrivy()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierType: tier,
          userEmail: user?.email?.address,
          walletAddress: user?.wallet?.address,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      window.location.href = data.url // redirect to Stripe checkout
    } catch (err: any) {
      toast({ title: 'Checkout failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-md"
    >
      {loading ? 'Redirecting...' : 'Confirm Purchase'}
    </button>
  )
}
