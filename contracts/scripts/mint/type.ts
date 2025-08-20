// scripts/mint/types.ts

export interface MintingParams {
  walletAddress: string
  tier: number
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
  }
}

export interface MintingResult {
  tokenId: string
  transactionHash: string
  tier: number
}

export interface MintingError extends Error {
  code?: string
  transactionHash?: string
}