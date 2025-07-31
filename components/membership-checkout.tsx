'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Anchor, Users, Award, Shield } from 'lucide-react';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

const membershipTiers: MembershipTier[] = [
  {
    id: 'standard',
    name: 'Standard Membership',
    price: 15000, // $150 in cents
    description: 'Full access to club facilities and events',
    benefits: [
      'Access to club facilities and marina',
      'Participation in all club events and regattas',
      'Voting rights in club decisions',
      'Access to member-only areas',
      'Discounted boat storage rates'
    ]
  },
  {
    id: 'family',
    name: 'Family Membership',
    price: 15000, // $150 in cents
    description: 'Perfect for families who love the water',
    benefits: [
      'All Standard Membership benefits',
      'Coverage for spouse and children under 18',
      'Family event participation',
      'Youth sailing program access',
      'Family locker room access'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Membership',
    price: 15000, // $150 in cents
    description: 'Enhanced experience with premium amenities',
    benefits: [
      'All Family Membership benefits',
      'Priority boat slip reservations',
      'Complimentary guest passes (5 per month)',
      'Access to premium club amenities',
      'Concierge services'
    ]
  }
];

export default function MembershipCheckout() {
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const { login, authenticated, user } = usePrivy();

  const handleCheckout = async () => {
    if (!authenticated) {
      await login();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierType: selectedTier,
          userEmail: user?.email?.address,
          walletAddress: user?.wallet?.address,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTierData = membershipTiers.find(tier => tier.id === selectedTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Anchor className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lake Stockton Yacht Club
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Where Adventure Meets Community!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Club Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              For over 50 years, the Lake Stockton Yacht Club has been a thriving community of passionate boaters and sailing enthusiasts. 
              Nestled in the Heartland on the pristine waters of Stockton Lake, Missouri, our club welcomes all—whether you own a yacht, 
              a dinghy, or no boat at all!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inclusive Community</h3>
              <p className="text-gray-600">Welcome to all boating enthusiasts, regardless of boat ownership</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">50+ Years Legacy</h3>
              <p className="text-gray-600">Rich history and tradition on beautiful Stockton Lake</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Experience</h3>
              <p className="text-gray-600">Access to exclusive facilities and member benefits</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Membership Tiers */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Membership</h2>
            <div className="space-y-4">
              {membershipTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 border-2 ${
                    selectedTier === tier.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                      <p className="text-gray-600 mt-1">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${(tier.price / 100).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-500">one-time</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Membership Summary</h3>
              
              {selectedTierData && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Membership Type:</span>
                    <span className="font-medium">{selectedTierData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">${(selectedTierData.price / 100).toFixed(0)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-blue-600">${(selectedTierData.price / 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : authenticated ? (
                  'Complete Purchase'
                ) : (
                  'Sign In & Purchase'
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Secure payment powered by Stripe</p>
                <p className="mt-1">Your NFT membership will be minted to your wallet upon successful payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}