// components/nfc-card-verifier.tsx
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { verifyNFCCard } from '@/lib/contracts'
import { YACHT_CLUB_CONTRACT } from '@/lib/contracts'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

interface NFCCardVerification {
  cardId: string
  isValid: boolean
  memberAddress: string
  tier: number
  verificationTime: string
}

export function NFCCardVerifier() {
  const [cardId, setCardId] = useState('')
  const [verification, setVerification] = useState<NFCCardVerification | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleVerifyCard = async () => {
    if (!cardId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a card ID",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Create public client for contract interaction
      const publicClient = createPublicClient({
        chain: base,
        transport: http()
      })

      // Verify the NFC card
      const result = await verifyNFCCard(
        { 
          address: YACHT_CLUB_CONTRACT.address,
          abi: YACHT_CLUB_CONTRACT.abi
        },
        cardId
      )

      const verificationData: NFCCardVerification = {
        cardId,
        isValid: result.isValid,
        memberAddress: result.memberAddress,
        tier: result.tier,
        verificationTime: new Date().toISOString()
      }

      setVerification(verificationData)

      if (result.isValid) {
        toast({
          title: "Card Verified",
          description: `Valid membership card for tier ${result.tier}`,
        })
      } else {
        toast({
          title: "Card Invalid",
          description: "This card is not linked to a valid membership",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: `Failed to verify card: ${error}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getTierName = (tier: number): string => {
    const tierNames = ['Standard', 'Premium', 'Elite', 'Lifetime']
    return tierNames[tier] || 'Unknown'
  }

  const getTierColor = (tier: number): string => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-yellow-100 text-yellow-800', 'bg-green-100 text-green-800']
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>NFC Card Verification</CardTitle>
        <CardDescription>
          Verify physical NFC membership cards for real-world access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card Input */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardId">NFC Card ID</Label>
            <div className="flex space-x-2">
              <Input
                id="cardId"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="Scan or enter NFC card ID"
                className="flex-1"
              />
              <Button 
                onClick={handleVerifyCard} 
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        {verification && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Verification Result</h3>
            <div className={`p-4 rounded-lg border ${verification.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-4 h-4 rounded-full ${verification.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`font-medium ${verification.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {verification.isValid ? 'Valid Membership Card' : 'Invalid Card'}
                </span>
              </div>
              
              {verification.isValid && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card ID:</span>
                    <span className="font-mono">{verification.cardId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Address:</span>
                    <span className="font-mono">{verification.memberAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membership Tier:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(verification.tier)}`}>
                      {getTierName(verification.tier)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified At:</span>
                    <span>{new Date(verification.verificationTime).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to Use</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tap or scan an NFC membership card</li>
            <li>• Or manually enter the card ID</li>
            <li>• Click Verify to check membership status</li>
            <li>• Valid cards show member information and tier</li>
          </ul>
        </div>

        {/* Recent Verifications */}
        {verification && (
          <div className="space-y-2">
            <h4 className="font-medium">Recent Verification</h4>
            <div className="text-sm text-gray-600">
              <p>Card: {verification.cardId}</p>
              <p>Status: {verification.isValid ? 'Valid' : 'Invalid'}</p>
              <p>Time: {new Date(verification.verificationTime).toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
