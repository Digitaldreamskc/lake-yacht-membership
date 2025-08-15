// app/real-world/page.tsx
"use client"

import { RealWorldInterface } from '@/components/real-world-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Zap, Globe, Users } from 'lucide-react'

export default function RealWorldPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Digital Meets Physical
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of membership with our revolutionary NFT + NFC card system. 
            Seamlessly bridge the digital and physical worlds for secure, instant access.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <CardTitle className="text-lg">Blockchain Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Immutable verification on Base blockchain ensures authenticity
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <CardTitle className="text-lg">Instant Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tap-to-verify technology provides immediate member validation
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <CardTitle className="text-lg">Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Works anywhere in the world, online or offline
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <CardTitle className="text-lg">Member Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Seamless integration between digital and physical identities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <RealWorldInterface />

        {/* Technical Details */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Technical Architecture</CardTitle>
              <CardDescription>
                How the system works under the hood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">Smart Contract Layer</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ERC-721 NFT standard</li>
                    <li>• NFC card linking functions</li>
                    <li>• Access control mechanisms</li>
                    <li>• Royalty management</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700">NFC Integration</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ISO 14443 NFC standard</li>
                    <li>• Unique card identification</li>
                    <li>• Real-time verification</li>
                    <li>• Secure data transmission</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-700">User Interface</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Web3 wallet integration</li>
                    <li>• Real-time status updates</li>
                    <li>• Cross-platform compatibility</li>
                    <li>• Intuitive user experience</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Real-World Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Access</CardTitle>
                <CardDescription>
                  Physical facility entry control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Members tap their NFC cards to gain access to club facilities, 
                  with real-time verification against their blockchain membership.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Check-in</CardTitle>
                <CardDescription>
                  Seamless event management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Staff can instantly verify membership status and tier privileges 
                  for events, workshops, and special occasions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Management</CardTitle>
                <CardDescription>
                  Controlled guest access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Premium and Elite members can bring guests, with the system 
                  automatically checking tier-based guest privileges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Online Services</CardTitle>
                <CardDescription>
                  Digital platform access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Members can access exclusive online content and services 
                  by connecting their wallet and verifying NFT ownership.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Merchandise</CardTitle>
                <CardDescription>
                  Member-exclusive purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Special member pricing and exclusive merchandise access 
                  based on verified membership tier and status.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Travel Benefits</CardTitle>
                <CardDescription>
                  Reciprocal club access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Members can access partner yacht clubs worldwide 
                  using their verified digital membership credentials.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Experience the Future?</CardTitle>
              <CardDescription className="text-blue-100">
                Join the Lake Stockton Yacht Club and get your digital membership today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-blue-100">
                Get started with a Standard membership and upgrade as you go. 
                Each tier includes enhanced benefits and NFC card privileges.
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="/"
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </a>
                <a 
                  href="/verify"
                  className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Try Verification
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
