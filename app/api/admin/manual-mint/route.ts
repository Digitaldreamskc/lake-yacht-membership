import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { MEMBERSHIP_PRICES } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress, tier } = await request.json()

    if (!email || !walletAddress || tier === undefined) {
      return NextResponse.json({ error: 'Email, wallet address, and tier are required' }, { status: 400 })
    }

    // Validate tier
    if (!(tier in MEMBERSHIP_PRICES)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Call the smart contract to mint the NFT
    // 2. Verify the transaction
    // 3. Store the result
    
    // For demo purposes, create a mock payment session
    const mockSessionId = `manual_${Date.now()}`
    const mockTokenId = Math.floor(Math.random() * 10000) + 1
    const price = MEMBERSHIP_PRICES[tier as keyof typeof MEMBERSHIP_PRICES]

    await db.createPaymentSession({
      sessionId: mockSessionId,
      email,
      tier,
      status: 'completed',
      walletAddress,
      tokenId: mockTokenId
    })

    return NextResponse.json({
      success: true,
      tokenId: mockTokenId,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64) // Mock tx hash
    })
  } catch (error) {
    console.error('Manual mint failed:', error)
    return NextResponse.json({ error: 'Manual mint failed' }, { status: 500 })
  }
}