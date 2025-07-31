export enum MemberTier {
  Standard = 0,
  Premium = 1,
  Elite = 2,
  Lifetime = 3
}

export interface MemberInfo {
  tier: MemberTier
  mintedAt: bigint
  email: string
  active: boolean
}

export interface MembershipData {
  tokenId: number
  owner: string
  memberInfo: MemberInfo
  tokenURI?: string
}

export interface PaymentSession {
  sessionId: string
  email: string
  tier: MemberTier
  amount: number
  status: 'pending' | 'completed' | 'failed'
  walletAddress?: string
  tokenId?: number
  createdAt: Date
  updatedAt: Date
}

export interface AdminStats {
  totalMembers: number
  totalRevenue: number
  membersByTier: Record<MemberTier, number>
  recentMints: MembershipData[]
  monthlyRevenue: Array<{ month: string; revenue: number }>
}