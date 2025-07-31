import Stripe from 'stripe'

// Use a default test key for development if STRIPE_SECRET_KEY is not set
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz12'

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16'
})

export const MEMBERSHIP_PRICES = {
  [0]: { // Standard
    amount: 15000, // $150 in cents
    name: 'Standard Membership',
    description: 'Basic yacht club membership with facility access'
  },
  [1]: { // Premium
    amount: 15000, // $150 in cents
    name: 'Premium Membership',
    description: 'Enhanced membership with additional privileges'
  },
  [2]: { // Elite
    amount: 15000, // $150 in cents
    name: 'Elite Membership',
    description: 'Top-tier membership with exclusive benefits'
  },
  [3]: { // Lifetime
    amount: 15000, // $150 in cents
    name: 'Lifetime Membership',
    description: 'Permanent membership with all privileges'
  }
}

export async function createCheckoutSession(
  tier: number,
  email: string,
  successUrl: string,
  cancelUrl: string
) {
  const price = MEMBERSHIP_PRICES[tier as keyof typeof MEMBERSHIP_PRICES]
  
  if (!price) {
    throw new Error('Invalid membership tier')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: price.name,
            description: price.description,
            images: ['https://images.pexels.com/photos/1007025/pexels-photo-1007025.jpeg?auto=compress&cs=tinysrgb&w=800']
          },
          unit_amount: price.amount
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    metadata: {
      tier: tier.toString(),
      email
    }
  })

  return session
}