import Stripe from 'stripe'
import { z } from 'zod' // Add for runtime type validation

// Types for membership tiers
interface MembershipTier {
    amount: number
    name: string
    description: string
    features: string[]
    nftMetadata: {
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
    }
}

// Validate environment variables
const REQUIRED_ENV = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NFT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
} as const

// Check for missing environment variables (only in production)
if (process.env.NODE_ENV === 'production') {
    Object.entries(REQUIRED_ENV).forEach(([key, value]) => {
        if (!value) {
            throw new Error(`Missing ${key} environment variable`)
        }
    })
}

// Initialize Stripe with proper error handling
export const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil',
        typescript: true,
      })
    : null

// Enhanced membership tiers with NFT metadata
export const MEMBERSHIP_TIERS: Record<number, MembershipTier> = {
    0: {
        amount: 15000, // $150.00 in cents
        name: 'Annual Membership',
        description: 'Annual yacht club membership with facility access and NFC card support',
        features: [
            'Access to club facilities',
            'Annual membership NFT',
            'Community events access',
            'NFC card for physical access',
        ],
        nftMetadata: {
            name: 'LSYC Annual Membership',
            description: 'Lake Stockton Yacht Club Annual Membership NFT with NFC card support',
            image: 'ipfs://QmMEMBERSHIP...', // Replace with actual IPFS hash
            external_url: 'https://lsyc.com/membership',
            attributes: [
                { trait_type: 'Tier', value: 'Annual Membership' },
                { trait_type: 'Year', value: new Date().getFullYear() },
                { trait_type: 'Price', value: '$150' },
                { trait_type: 'Validity', value: '1 Year' },
                { trait_type: 'NFC Card Support', value: 'Yes' },
                { trait_type: 'Card Type', value: 'Annual Membership' },
            ],
            nfcCard: {
                cardType: 'Annual Membership',
                isActive: false
            }
        }
    },
};

// Input validation schema
const checkoutInputSchema = z.object({
    tier: z.number().min(0).max(0), // Only tier 0 available
    email: z.string().email(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
})

// Enhanced checkout session creation
export async function createCheckoutSession({
    tier,
    email,
    walletAddress,
    successUrl,
    cancelUrl,
}: {
    tier: number
    email: string
    walletAddress: string
    successUrl: string
    cancelUrl: string
}) {
    try {
        // Validate inputs
        const validated = checkoutInputSchema.parse({
            tier,
            email,
            walletAddress,
            successUrl,
            cancelUrl,
        })

        const membershipTier = MEMBERSHIP_TIERS[validated.tier]
        if (!membershipTier) {
            throw new Error('Invalid membership tier')
        }

        // Create or retrieve product
        const product = await stripe.products.create({
            name: membershipTier.name,
            description: membershipTier.description,
            images: ['https://images.pexels.com/photos/1007025/pexels-photo-1007025.jpeg?auto=compress&cs=tinysrgb&w=800'],
            metadata: {
                tier: validated.tier.toString(),
                contractAddress: REQUIRED_ENV.NFT_CONTRACT_ADDRESS,
                nftMetadata: JSON.stringify(membershipTier.nftMetadata),
                features: JSON.stringify(membershipTier.features),
            },
        })

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product: product.id,
                    unit_amount: membershipTier.amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: validated.successUrl,
            cancel_url: validated.cancelUrl,
            customer_email: validated.email,
            metadata: {
                tier: validated.tier.toString(),
                email: validated.email,
                walletAddress: validated.walletAddress,
                contractAddress: REQUIRED_ENV.NFT_CONTRACT_ADDRESS,
                nftMetadata: JSON.stringify(membershipTier.nftMetadata),
            },
            payment_intent_data: {
                metadata: {
                    tier: validated.tier.toString(),
                    walletAddress: validated.walletAddress,
                    nftMetadata: JSON.stringify(membershipTier.nftMetadata),
                },
            },
        })

        return {
            sessionId: session.id,
            url: session.url,
            tier: validated.tier,
            nftMetadata: membershipTier.nftMetadata,
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`)
        }
        if (error instanceof Stripe.errors.StripeError) {
            throw new Error(`Payment error: ${error.message}`)
        }
        throw error
    }
}

// Helper function to verify webhook signatures
export async function verifyStripeWebhook(payload: string, signature: string) {
    try {
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            REQUIRED_ENV.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
}