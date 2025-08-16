// lib/config.ts
// Configuration file for the tokenized membership system

export const config = {
  // Base Network Configuration
  base: {
    chainId: 8453, // Base mainnet
    chainName: 'Base',
    rpcUrl: process.env.RPC_URL || 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  
  // Contract Configuration
  contract: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    privateKey: process.env.CONTRACT_PRIVATE_KEY,
    authorizedMinter: process.env.AUTHORIZED_MINTER_ADDRESS,
    royaltyRecipient: process.env.ROYALTY_RECIPIENT_ADDRESS,
    royaltyFraction: 1000, // 10% in basis points
  },
  
  // Privy Configuration
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    appSecret: process.env.PRIVY_APP_SECRET,
  },
  
  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID,
  },
  
  // NFT Configuration
  nft: {
    tokenUri: process.env.MEMBERSHIP_TOKEN_URI || 'https://example.com/metadata/default.json',
    baseUri: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
  
  // Application Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Membership Tiers
  membershipTiers: {
    0: {
      id: 0,
      name: 'Standard',
      price: 150, // $150
      benefits: ['Club access', 'Facility access', 'Community events', 'NFC card support', 'Basic member events', 'Standard support'],
    },
    1: {
      id: 1,
      name: 'Premium',
      price: 300, // $300
      benefits: ['Club access', 'Facility access', 'Community events', 'NFC card support', 'Priority event access', 'Guest privileges', 'Premium support'],
    },
    2: {
      id: 2,
      name: 'Elite',
      price: 500, // $500
      benefits: ['Club access', 'Facility access', 'Community events', 'NFC card support', 'Priority event access', 'Guest privileges', 'VIP event access', 'Concierge service', 'Exclusive member events'],
    },
    3: {
      id: 3,
      name: 'Lifetime',
      price: 2000, // $2000
      benefits: ['Club access', 'Facility access', 'Community events', 'NFC card support', 'Priority event access', 'Guest privileges', 'VIP event access', 'Concierge service', 'Exclusive member events', 'Lifetime access', 'Priority reservations', 'Founding member status'],
    },
  },
  
  // NFC Card Configuration
  nfc: {
    cardTypes: {
      MEMBERSHIP: 'Annual Membership',
    },
    validation: {
      cardIdLength: { min: 8, max: 32 },
      serialNumberLength: { min: 6, max: 20 },
    },
  },
} as const;

// Type exports
export type MembershipTier = keyof typeof config.membershipTiers;
export type NFCCardType = keyof typeof config.nfc.cardTypes;

// Helper functions
export const getTierById = (id: number) => {
  return Object.values(config.membershipTiers).find(tier => tier.id === id);
};

export const getTierByName = (name: string) => {
  return Object.values(config.membershipTiers).find(tier => 
    tier.name.toLowerCase() === name.toLowerCase()
  );
};

export const isValidChainId = (chainId: number) => {
  return chainId === config.base.chainId;
};

export const getContractAddress = () => {
  if (!config.contract.address || config.contract.address === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.');
  }
  return config.contract.address;
};
