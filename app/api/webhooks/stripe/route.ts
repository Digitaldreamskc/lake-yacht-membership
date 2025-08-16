// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

// Use your existing Stripe helper if you have one; otherwise create a client here:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil'
})

/**
 * Single-tier setup (no external constants needed)
 * Keep number as string if you pass it around as metadata
 */
const TIER_NUMBER = '1'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = headers().get('stripe-signature')
        if (!signature) {
            return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
        }

        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            )
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err?.message)
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                // Pull the metadata we set in create-checkout
                const tier = session.metadata?.tier ?? TIER_NUMBER
                const walletAddress = session.metadata?.walletAddress ?? ''
                const email = session.metadata?.email ?? ''

                if (!walletAddress) {
                    console.warn('No walletAddress in metadata; skipping mint.')
                    break
                }

                // TODO: replace these with your actual implementations
                // await mintMembership(walletAddress, tier)
                // await saveToDatabase({ sessionId: session.id, walletAddress, email, tier })

                console.log('✅ checkout.session.completed', {
                    sessionId: session.id,
                    walletAddress,
                    email,
                    tier,
                })
                break
            }

            case 'payment_intent.succeeded': {
                const pi = event.data.object as Stripe.PaymentIntent
                console.log('payment_intent.succeeded', { id: pi.id, amount: pi.amount })
                break
            }

            case 'payment_intent.payment_failed': {
                const pi = event.data.object as Stripe.PaymentIntent
                console.error('payment_intent.payment_failed', {
                    id: pi.id,
                    lastError: pi.last_payment_error?.message,
                })
                break
            }

            default:
                // console.log('Unhandled event', event.type)
                break
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (err: any) {
        console.error('Webhook handler failed:', err?.message ?? err)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
}
