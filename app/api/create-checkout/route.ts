// app/api/create-checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs' // ensure Node.js runtime for Stripe SDK

// --- Env setup ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables.')
}
const PRICE_ID = process.env.STRIPE_PRICE_ID // optional: use a pre-created Stripe Price

// --- Stripe client ---
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
})

type CreateCheckoutBody = {
    walletAddress?: string
    userEmail?: string
    // keeping this for future expansion, but we hardcode to one tier now
    tierType?: string
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as CreateCheckoutBody | null
        const walletAddress = body?.walletAddress ?? ''
        const userEmail = body?.userEmail ?? ''
        const tierType = body?.tierType ?? 'Standard'

        // One tier only: $150 USD
        const TIER_NUMBER = 1
        const PRODUCT_NAME = 'LSYC Yacht Club Membership'
        const UNIT_AMOUNT = 15000 // $150.00 in cents

        // Build absolute redirect URLs
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

            customer_email: userEmail || undefined,
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cancel`,

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

        return NextResponse.json({ id: session.id, url: session.url }, { status: 200 })
    } catch (err: any) {
        console.error('Stripe Checkout create error:', err)
        return NextResponse.json(
            { error: { message: err?.message ?? 'Unable to create checkout session.' } },
            { status: 500 }
        )
    }
}
