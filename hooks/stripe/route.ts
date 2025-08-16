import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/database'
import { headers } from 'next/headers'
import { mintMembershipServer } from '@/lib/contracts/mint'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    try {
        // Check if stripe client is available
        if (!stripe) {
            logger.error('Stripe client not initialized')
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
        }

        const body = await request.text()
        const signature = headers().get('stripe-signature')!

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            logger.error('Webhook signature verification failed', { error: err })
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                await handleCheckoutCompleted(session)
                break
            }
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                await handlePaymentSucceeded(paymentIntent)
                break
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                await handlePaymentFailed(paymentIntent)
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        logger.error('Webhook handler failed', { error })
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
        // Pull metadata from Stripe session
        const tier = session.metadata?.tier || '1'
        const walletAddress = session.metadata?.walletAddress || ''
        const email = session.metadata?.email || ''

        const paymentSession = await db.transaction(async (trx: typeof db) => {
            const existing = await trx.getPaymentSession(session.id)
            if (existing && existing.status === 'completed') return existing

            // Mint the NFT for the provided wallet/tier
            const tokenId = await mintMembershipServer({
                to: walletAddress,
                tier: parseInt(tier),
                email: email,
                tokenURI: '' // TODO: Generate proper tokenURI
            })

            // Store/update in DB
            return await trx.updatePaymentSession(session.id, {
                status: 'completed',
                tokenId,
                walletAddress,
                email,
                tier,
                completedAt: new Date().toISOString()
            })
        })

        logger.info('Checkout completed successfully', {
            sessionId: session.id,
            tokenId: paymentSession?.tokenId,
            walletAddress,
            email,
            tier
        })
    } catch (error) {
        logger.error('Failed to process checkout completion', {
            error,
            sessionId: session.id
        })
        throw error
    }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    logger.info('Payment succeeded', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount
    })
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    logger.error('Payment failed', {
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error
    })
}
