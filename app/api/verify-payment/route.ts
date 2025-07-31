import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Get payment session from database
    const paymentSession = await db.getPaymentSession(sessionId)
    
    if (!paymentSession) {
      return NextResponse.json({ error: 'Payment session not found' }, { status: 404 })
    }

    if (paymentSession.status === 'completed') {
      // Already processed, return existing data
      return NextResponse.json({
        success: true,
        membership: {
          tokenId: paymentSession.tokenId,
          tier: getTierName(paymentSession.tier),
          walletAddress: paymentSession.walletAddress
        }
      })
    }

    // Get wallet address from payment session
    const walletAddress = paymentSession.walletAddress
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address not found' }, { status: 400 })
    }
    
    // In a real implementation, you would:
    // 1. Call the smart contract to mint the NFT
    // 2. Upload metadata to IPFS
    // 3. Update the contract with the token URI
    
    // For demo purposes, we'll simulate the minting process
    const mockTokenId = Math.floor(Math.random() * 10000) + 1
    
    // Update payment session as completed
    await db.updatePaymentSession(sessionId, {
      status: 'completed',
      tokenId: mockTokenId
    })

    return NextResponse.json({
      success: true,
      membership: {
        tokenId: mockTokenId,
        tier: getTierName(paymentSession.tier),
        walletAddress
      }
    })
  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}

function getTierName(tier: number): string {
  const names = ['Standard', 'Premium', 'Elite', 'Lifetime']
  return names[tier] || 'Standard'
}