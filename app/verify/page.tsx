// app/verify/page.tsx
"use client"

import { NFCCardVerifier } from '@/components/nfc-card-verifier'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, CreditCard } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            LSYC Membership Verification
          </h1>
          <p className="text-xl text-gray-600">
            Verify physical NFC membership cards for real-world access
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle>Secure Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Blockchain-verified membership status with real-time validation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>Member Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Instant access control based on membership tier and status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle>NFC Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Tap-to-verify technology for seamless member identification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Verification Component */}
        <NFCCardVerifier />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Understanding the NFC card verification process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Card Detection</p>
                  <p className="text-sm text-gray-600">Staff taps or scans the NFC membership card</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Blockchain Verification</p>
                  <p className="text-sm text-gray-600">System checks card against Base blockchain</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Access Control</p>
                  <p className="text-sm text-gray-600">Grant or deny access based on verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membership Tiers</CardTitle>
              <CardDescription>
                Different access levels and privileges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="font-medium">Standard</span>
                <span className="text-sm text-blue-600">Basic Access</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                <span className="font-medium">Premium</span>
                <span className="text-sm text-purple-600">Enhanced Access</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="font-medium">Elite</span>
                <span className="text-sm text-yellow-600">VIP Access</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="font-medium">Lifetime</span>
                <span className="text-sm text-green-600">Unlimited Access</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>Lake Stockton Yacht Club • Powered by Base Blockchain</p>
          <p className="text-sm mt-1">
            For technical support, contact the IT department
          </p>
        </div>
      </div>
    </div>
  )
}
