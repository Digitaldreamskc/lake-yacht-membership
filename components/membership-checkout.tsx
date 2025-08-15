// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { mintMembershipServer } from '@/lib/contracts'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = headers().get('stripe-signature')!

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        )

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            // Extract metadata from the session
            const {
                tierType,
                userEmail,
                walletAddress
            } = session.metadata!

            // Map tier to contract tier number
            const tierMap: Record<string, number> = {
                'standard': 1,
                'family': 2,
                'premium': 3
            }

            try {
                // Mint the NFT on the server side after successful payment
                const tokenId = await mintMembershipServer({
                    to: walletAddress as `0x${string}`,
                    tier: tierMap[tierType],
                    email: userEmail,
                    tokenURI: `https://metadata.yourdomain.com/${tierType}`
                })

                // Save to database
                // await db.membership.create({
                //   walletAddress,
                //   tokenId: tokenId.toString(),
                //   tier: tierMap[tierType],
                //   email: userEmail,
                //   stripeSessionId: session.id,
                //   createdAt: new Date()
                // })

                console.log(`Membership NFT minted successfully: ${tokenId}`)

            } catch (error) {
                console.error('Failed to mint NFT after payment:', error)
                // You might want to queue this for retry or send a notification
            }
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 400 }
        )
    }
}