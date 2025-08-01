import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // 👈 Fix: bypass type mismatch
});

export async function POST(req: Request) {
  try {
    const { tierType, userEmail, walletAddress } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Yacht Club Membership - ${tierType}`,
            },
            unit_amount: 15000, // Optionally make this dynamic later
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        tier: tierType,
        email: userEmail,
        wallet: walletAddress,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[CHECKOUT_ERROR]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
