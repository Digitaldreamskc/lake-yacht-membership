'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1567899378494-47b22a2f94a2?q=80&w=1920&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/70 via-blue-900/50 to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
            Lake Stockton Yacht Club
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/80 max-w-xl">
            Unrivaled community, pristine waters, and a legacy of sailing excellence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            {/* Smooth scroll to pricing section */}
            <Button
              size="lg"
              onClick={() => {
                const el = document.getElementById('membership');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Become a Member
            </Button>

            {/* Members login (privy sign-in page you’ll wire up) */}
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">Members Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
