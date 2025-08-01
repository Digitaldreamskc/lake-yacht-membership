import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil'
})

const MEMBERSHIP_TIERS: Record<string, { name: string; amount: number; description: string }> = {
  Standard: {
    name: 'Standard Membership',
    amount: 15000, // $150
    description: 'Full access to club facilities and events'
  },
  Family: {
    name: 'Family Membership',
    amount: 15000, // $150 - matches your UI
    description: 'Perfect for families who love the water'
  },
  Premium: {
    name: 'Premium Membership',
    amount: 15000, // $150 - changed from 30000 to match your UI
    description: 'Enhanced experience with premium amenities'
  },
  Elite: {
    name: 'Elite Membership',
    amount: 50000, // $500
    description: 'Top-tier access with exclusive privileges and concierge services'
  },
  Lifetime: {
    name: 'Lifetime Membership',
    amount: 100000, // $1000
    description: 'One-time fee for permanent access and VIP benefits'
  }
}

export async function POST(req: Request) {
  try {
    const { tierType, userEmail, walletAddress } = await req.json()
    
    // ✅ Validate input types
    if (
      typeof tierType !== 'string' ||
      typeof userEmail !== 'string' ||
      typeof walletAddress !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid input. Please check tier, email, and wallet address.' },
        { status: 400 }
      )
    }
    
    // ✅ Check tier validity
    const tier = MEMBERSHIP_TIERS[tierType]
    if (!tier) {
      return NextResponse.json(
        { error: `Invalid membership tier: "${tierType}"` },
        { status: 400 }
      )
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_BASE_URL in environment' },
        { status: 500 }
      )
    }
    
    // ✅ Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: tier.description,
              images: [
                'https://images.pexels.com/photos/1007025/pexels-photo-1007025.jpeg?auto=compress&cs=tinysrgb&w=800'
              ]
            },
            unit_amount: tier.amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: userEmail,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        tier: tierType,
        email: userEmail,
        wallet: walletAddress
      }
    })
    
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[CREATE_CHECKOUT_ERROR]', error)
    return NextResponse.json(
      { error: 'Something went wrong while creating the checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
