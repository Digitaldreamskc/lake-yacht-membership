// app/api/create-checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs' // ensure Node.js runtime for Stripe SDK

// --- Env setup ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const PRICE_ID = process.env.STRIPE_PRICE_ID // optional: use a pre-created Stripe Price

if (!STRIPE_SECRET_KEY) {
  throw new Error('❌ STRIPE_SECRET_KEY not defined in environment')
}

// --- Stripe client ---
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
    typescript: true,
})

// Log environment awareness during development
if (process.env.NODE_ENV !== 'production') {
    console.log('🧪 Stripe config:', {
        keySet: !!STRIPE_SECRET_KEY,
        priceId: PRICE_ID || '(inline)',
    });
}

type CreateCheckoutBody = {
    walletAddress?: string
    userEmail?: string
    // keeping this for future expansion, but we hardcode to one tier now
    tierType?: string
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as CreateCheckoutBody | null
        
        if (!body) {
            return NextResponse.json(
                { error: 'Request body is required' },
                { status: 400 }
            )
        }

        const walletAddress = body?.walletAddress ?? ''
        const userEmail = body?.userEmail ?? ''
        const tierType = body?.tierType ?? 'Standard'

        // Validate required fields
        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            )
        }

        if (!userEmail) {
            return NextResponse.json(
                { error: 'User email is required' },
                { status: 400 }
            )
        }

        // One tier only: $150 USD
        const TIER_NUMBER = 1
        const PRODUCT_NAME = 'LSYC Yacht Club Membership'
        const UNIT_AMOUNT = 15000 // $150.00 in cents

        // Build absolute redirect URLs with fallbacks
        const { origin } = new URL(req.url)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin

        // Create the Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],

            // If you have a Stripe Price ID for $150, use it; otherwise inline price data
            line_items: PRICE_ID
                ? [{ price: PRICE_ID, quantity: 1 }]
                : [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: PRODUCT_NAME,
                                description: `${tierType} membership for Lake Stockton Yacht Club`,
                            },
                            unit_amount: UNIT_AMOUNT,
                        },
                        quantity: 1,
                    },
                ],

            customer_email: userEmail,
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/`, // Redirect to home page instead of non-existent cancel page

            // ✅ Make sure these land in your webhook for minting
            metadata: {
                tier: String(TIER_NUMBER),
                walletAddress,
                email: userEmail,
                tierType,
            },

            // Mirror onto PaymentIntent too (handy for other event types)
            payment_intent_data: {
                metadata: {
                    tier: String(TIER_NUMBER),
                    walletAddress,
                    email: userEmail,
                    tierType,
                },
            },
        })

        console.log('✅ Stripe checkout session created successfully:', {
            sessionId: session.id,
            walletAddress,
            userEmail,
            tierType
        })

        return NextResponse.json({ 
            id: session.id, 
            url: session.url 
        }, { status: 200 })

    } catch (err: any) {
        console.error('❌ Stripe Checkout create error:', {
            message: err.message,
            type: err.type,
            stack: err.stack,
            raw: err,
        })
        
        // Handle Stripe-specific errors
        if (err.type === 'StripeCardError') {
            return NextResponse.json(
                { error: 'Your card was declined.' },
                { status: 400 }
            )
        } else if (err.type === 'StripeInvalidRequestError') {
            return NextResponse.json(
                { error: 'Invalid payment information.' },
                { status: 500 }
            )
        } else if (err.type === 'StripeAPIError') {
            return NextResponse.json(
                { error: 'Payment service temporarily unavailable. Please try again.' },
                { status: 503 }
            )
        }

        return NextResponse.json(
            { error: 'Unable to create checkout session. Please try again.' },
            { status: 500 }
        )
    }
}
