import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { MEMBERSHIP_PRICES } from '@/lib/stripe'

export async function GET() {
  try {
    // Get all completed payment sessions
    const sessions = await db.getAllSessions()
    const completedSessions = sessions.filter((s: any) => s.status === 'completed')
    
    // Calculate stats
    const totalMembers = completedSessions.length
    const totalRevenue = completedSessions.reduce((sum: number, session: any) => sum + session.amount, 0) / 100 // Convert from cents
    const activeMembers = completedSessions.length // For demo, assume all are active
    
    // Mock membership data for demo
    const memberships = completedSessions.map((session: any) => ({
      tokenId: session.tokenId || 1,
      owner: session.walletAddress || '0x1234...5678',
      memberInfo: {
        tier: session.tier,
        mintedAt: BigInt(Math.floor(session.createdAt.getTime() / 1000)),
        email: session.email,
        active: true
      }
    }))

    return NextResponse.json({
      totalMembers,
      totalRevenue,
      activeMembers,
      monthlyGrowth: 12, // Mock data
      memberships
    })
  } catch (error) {
    console.error('Dashboard data fetch failed:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}