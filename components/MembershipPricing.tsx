'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const features = [
  'Full access to club facilities',
  'Entry to all social events',
  'Sailing regatta participation',
  'Access to youth sailing programs',
  'Guest privileges',
  'Exclusive digital membership token (NFT)',
];

export default function MembershipPricing() {
  return (
    <section id="membership" className="py-24 sm:py-32 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight text-blue-950 sm:text-5xl">
            Annual Membership
          </h2>
          <p className="mt-6 text-lg text-blue-950/70">
            Join a vibrant community of sailing enthusiasts. Your annual membership unlocks a
            full year of unparalleled lakeside experiences and benefits.
          </p>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="max-w-md w-full">
            <Card className="transition-transform hover:-translate-y-1 border-blue-900/10 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight text-blue-950">
                      LSYC Membership
                    </h3>
                    <p className="text-blue-950/60 mt-2">One pass to access it all.</p>

                    <div className="mt-6">
                      <span className="text-5xl font-extrabold tracking-tighter">$150</span>
                      <span className="text-blue-950/60"> / year</span>
                    </div>

                    <ul className="mt-8 space-y-4 text-blue-950/80">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-1">
                            <Check className="w-5 h-5 text-blue-900" strokeWidth={3} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10">
                    {/* Scroll to checkout section on the same page */}
                    <Button
                      className="w-full"
                      onClick={() => {
                        const el = document.getElementById('checkout');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      Purchase Membership
                    </Button>

                    {/* If you prefer a separate route later, swap with:
                        <Button asChild className="w-full"><Link href="/checkout">Purchase Membership</Link></Button>
                    */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
