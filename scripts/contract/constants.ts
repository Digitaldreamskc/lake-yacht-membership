// scripts/lib/constants.ts

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
export const PRIVATE_KEY = process.env.CONTRACT_PRIVATE_KEY as string
export const RPC_URL = process.env.RPC_URL as string

export const MEMBERSHIP_TIERS = {
  STANDARD: 0,
  PREMIUM: 1,
  ELITE: 2,
  LIFETIME: 3,
} as const

export const TIER_NAMES = {
  [MEMBERSHIP_TIERS.STANDARD]: 'Standard',
  [MEMBERSHIP_TIERS.PREMIUM]: 'Premium',
  [MEMBERSHIP_TIERS.ELITE]: 'Elite',
  [MEMBERSHIP_TIERS.LIFETIME]: 'Lifetime',
} as const