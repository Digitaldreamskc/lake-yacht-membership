// lib/metadata.ts
// NFT Metadata Management System

import { config, getTierById } from './config'

export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  nfcCard?: {
    cardType: string
    serialNumber?: string
    linkedAt?: string
    isActive: boolean
  }
  properties?: {
    files?: Array<{
      type: string
      uri: string
    }>
    category?: string
  }
}

export interface MembershipMetadataParams {
  tier: number
  memberName?: string
  memberEmail: string
  walletAddress: string
  mintedAt: string
  nfcCardId?: string
  nfcSerialNumber?: string
}

/**
 * Generate NFT metadata for a membership
 */
export function generateMembershipMetadata(params: MembershipMetadataParams): NFTMetadata {
  // Use the helper function to find tier by ID
  const tier = getTierById(params.tier)
  
  if (!tier) {
    throw new Error(`Invalid tier: ${params.tier}`)
  }

  const baseMetadata: NFTMetadata = {
    name: `LSYC ${tier.name} Membership`,
    description: `Lake Stockton Yacht Club ${tier.name} Membership NFT${params.nfcCardId ? ' with linked NFC card' : ''}`,
    image: `ipfs://Qm${tier.name.toUpperCase()}...`, // TODO: Replace with actual IPFS hash
    external_url: `${config.app.url}/membership/${params.walletAddress}`,
    attributes: [
      { trait_type: 'Tier', value: tier.name },
      { trait_type: 'Year', value: new Date().getFullYear() },
      { trait_type: 'Access Level', value: tier.id + 1 },
      { trait_type: 'Member Email', value: params.memberEmail },
      { trait_type: 'Minted At', value: params.mintedAt },
      { trait_type: 'NFC Card Support', value: 'Yes' },
      { trait_type: 'Card Type', value: tier.name },
    ],
    nfcCard: {
      cardType: tier.name,
      isActive: false
    },
    properties: {
      files: [
        {
          type: 'image/png',
          uri: `ipfs://Qm${tier.name.toUpperCase()}...` // TODO: Replace with actual IPFS hash
        }
      ],
      category: 'membership'
    }
  }

  // Add tier-specific attributes
  if (tier.benefits.includes('Guest privileges')) {
    baseMetadata.attributes.push({ trait_type: 'Guest Privileges', value: 'Yes' })
  }
  
  if (tier.benefits.includes('VIP event access')) {
    baseMetadata.attributes.push({ trait_type: 'VIP Access', value: 'Yes' })
  }
  
  if (tier.benefits.includes('Exclusive member events')) {
    baseMetadata.attributes.push({ trait_type: 'Special Events', value: 'Yes' })
  }
  
  if (tier.benefits.includes('Lifetime access')) {
    baseMetadata.attributes.push({ trait_type: 'Validity', value: 'Lifetime' })
  }

  // Add NFC card information if available
  if (params.nfcCardId && params.nfcSerialNumber) {
    baseMetadata.nfcCard = {
      cardType: tier.name,
      serialNumber: params.nfcSerialNumber,
      linkedAt: new Date().toISOString(),
      isActive: true
    }
    
    baseMetadata.attributes.push(
      { trait_type: 'NFC Card ID', value: params.nfcCardId },
      { trait_type: 'NFC Serial Number', value: params.nfcSerialNumber }
    )
  }

  return baseMetadata
}

/**
 * Update metadata with NFC card linking information
 */
export function updateMetadataWithNFCCard(
  metadata: NFTMetadata,
  nfcCardId: string,
  serialNumber: string
): NFTMetadata {
  const updatedMetadata = { ...metadata }
  
  if (updatedMetadata.nfcCard) {
    updatedMetadata.nfcCard = {
      ...updatedMetadata.nfcCard,
      serialNumber,
      linkedAt: new Date().toISOString(),
      isActive: true
    }
  }

  // Add or update NFC-related attributes
  const nfcAttributes = [
    { trait_type: 'NFC Card ID', value: nfcCardId },
    { trait_type: 'NFC Serial Number', value: serialNumber },
    { trait_type: 'NFC Linked At', value: new Date().toISOString() }
  ]

  // Remove existing NFC attributes if they exist
  updatedMetadata.attributes = updatedMetadata.attributes.filter(
    attr => !['NFC Card ID', 'NFC Serial Number', 'NFC Linked At'].includes(attr.trait_type)
  )

  // Add new NFC attributes
  updatedMetadata.attributes.push(...nfcAttributes)

  return updatedMetadata
}

/**
 * Validate NFT metadata structure
 */
export function validateMetadata(metadata: NFTMetadata): boolean {
  const requiredFields = ['name', 'description', 'image', 'attributes']
  
  for (const field of requiredFields) {
    if (!metadata[field as keyof NFTMetadata]) {
      return false
    }
  }

  if (!Array.isArray(metadata.attributes) || metadata.attributes.length === 0) {
    return false
  }

  return true
}

/**
 * Generate metadata URI for IPFS storage
 */
export function generateMetadataURI(metadata: NFTMetadata): string {
  if (!validateMetadata(metadata)) {
    throw new Error('Invalid metadata structure')
  }

  // TODO: Implement IPFS upload logic
  // For now, return a placeholder URI
  const metadataHash = Buffer.from(JSON.stringify(metadata)).toString('base64').slice(0, 10)
  return `ipfs://Qm${metadataHash}...`
}

/**
 * Parse metadata from URI
 */
export async function parseMetadataFromURI(uri: string): Promise<NFTMetadata> {
  try {
    // TODO: Implement IPFS retrieval logic
    // For now, return a placeholder
    throw new Error('IPFS retrieval not yet implemented')
  } catch (error) {
    throw new Error(`Failed to parse metadata from URI: ${error}`)
  }
}

/**
 * Get metadata for a specific membership tier
 */
export function getTierMetadata(tierId: number): NFTMetadata | null {
  const tier = config.membershipTiers[tierId as keyof typeof config.membershipTiers]
  
  if (!tier) {
    return null
  }

  return {
    name: `LSYC ${tier.name} Membership`,
    description: `Lake Stockton Yacht Club ${tier.name} Membership NFT`,
    image: `ipfs://Qm${tier.name.toUpperCase()}...`, // TODO: Replace with actual IPFS hash
    external_url: `${config.app.url}/membership/tier/${tierId}`,
    attributes: [
      { trait_type: 'Tier', value: tier.name },
      { trait_type: 'Year', value: new Date().getFullYear() },
      { trait_type: 'Access Level', value: tier.id + 1 },
      { trait_type: 'Price', value: `$${tier.price}` },
      { trait_type: 'NFC Card Support', value: 'Yes' },
      { trait_type: 'Card Type', value: tier.name },
    ],
    nfcCard: {
      cardType: tier.name,
      isActive: false
    }
  }
}
