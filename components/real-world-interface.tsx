// components/real-world-interface.tsx
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NFCCardVerifier } from './nfc-card-verifier'
import { usePrivy } from '@privy-io/react-auth'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { YACHT_CLUB_CONTRACT } from '@/lib/contracts'
import { getTierMetadata } from '@/lib/metadata'

interface MembershipStatus {
  tokenId: string
  tier: string
  memberAddress: string
  nfcCardLinked: boolean
  nfcCardId?: string
  lastVerified: string
}

export function RealWorldInterface() {
  const { user, authenticated } = usePrivy()
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkMembershipStatus = async () => {
    if (!authenticated || !user?.wallet?.address) return

    setLoading(true)
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
      })

      // Check if user is a member
      const isMember = await publicClient.readContract({
        address: YACHT_CLUB_CONTRACT.address,
        abi: YACHT_CLUB_CONTRACT.abi,
        functionName: 'isMember',
        args: [user.wallet.address as `0x${string}`]
      })

      if (isMember) {
        // Get token ID
        const tokenId = await publicClient.readContract({
          address: YACHT_CLUB_CONTRACT.address,
          abi: YACHT_CLUB_CONTRACT.abi,
          functionName: 'getTokenIdByMember',
          args: [user.wallet.address as `0x${string}`]
        })

        // Get member info
        const memberInfo = await publicClient.readContract({
          address: YACHT_CLUB_CONTRACT.address,
          abi: YACHT_CLUB_CONTRACT.abi,
          functionName: 'getMemberInfo',
          args: [tokenId]
        })

        // Check NFC card status (this would need to be implemented in the contract)
        const nfcCardLinked = false // TODO: Implement NFC card checking

        setMembershipStatus({
          tokenId: tokenId.toString(),
          tier: getTierName(memberInfo.tier),
          memberAddress: user.wallet.address,
          nfcCardLinked,
          lastVerified: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to check membership status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierName = (tier: number): string => {
    const tierNames = ['Standard', 'Premium', 'Elite', 'Lifetime']
    return tierNames[tier] || 'Unknown'
  }

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      'Standard': 'bg-blue-100 text-blue-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Elite': 'bg-yellow-100 text-yellow-800',
      'Lifetime': 'bg-green-100 text-green-800'
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Real-World Integration
        </h2>
        <p className="text-gray-600">
          Experience the seamless connection between digital NFTs and physical NFC cards
        </p>
      </div>

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="verification">Card Verification</TabsTrigger>
          <TabsTrigger value="membership">My Membership</TabsTrigger>
          <TabsTrigger value="integration">How It Works</TabsTrigger>
        </TabsList>

        {/* Card Verification Tab */}
        <TabsContent value="verification" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>NFC Card Verification</CardTitle>
              <CardDescription>
                Staff can verify physical membership cards for real-world access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NFCCardVerifier />
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Membership Tab */}
        <TabsContent value="membership" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Digital Membership</CardTitle>
              <CardDescription>
                View your NFT membership and NFC card status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!authenticated ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Please connect your wallet to view membership</p>
                  <Button disabled>Connect Wallet</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Wallet Address</p>
                      <p className="text-sm text-gray-600 font-mono">
                        {user.wallet?.address}
                      </p>
                    </div>
                    <Badge variant="outline">Connected</Badge>
                  </div>

                  {!membershipStatus ? (
                    <div className="text-center py-8">
                      <Button 
                        onClick={checkMembershipStatus}
                        disabled={loading}
                      >
                        {loading ? "Checking..." : "Check Membership Status"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-900">Token ID</p>
                          <p className="text-2xl font-bold text-blue-600">
                            #{membershipStatus.tokenId}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-900">Membership Tier</p>
                          <Badge className={`text-sm ${getTierColor(membershipStatus.tier)}`}>
                            {membershipStatus.tier}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-900 mb-2">NFC Card Status</p>
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${membershipStatus.nfcCardLinked ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={membershipStatus.nfcCardLinked ? 'text-green-700' : 'text-red-700'}>
                            {membershipStatus.nfcCardLinked ? 'Card Linked' : 'No Card Linked'}
                          </span>
                        </div>
                        {membershipStatus.nfcCardId && (
                          <p className="text-sm text-purple-600 mt-1">
                            Card ID: {membershipStatus.nfcCardId}
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900 mb-2">Last Verified</p>
                        <p className="text-sm text-gray-600">
                          {new Date(membershipStatus.lastVerified).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* How It Works Tab */}
        <TabsContent value="integration" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Digital NFT</CardTitle>
                <CardDescription>
                  Your blockchain-based membership token
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Stored on Base blockchain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Immutable and secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Transferable ownership</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Metadata includes NFC info</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Physical NFC Card</CardTitle>
                <CardDescription>
                  Your real-world membership card
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Tap-to-verify technology</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Linked to digital NFT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Real-time verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Access control integration</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integration Benefits</CardTitle>
              <CardDescription>
                Why this system provides the best of both worlds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    🔒
                  </div>
                  <h4 className="font-medium mb-2">Security</h4>
                  <p className="text-sm text-gray-600">
                    Blockchain verification prevents fraud and ensures authenticity
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    ⚡
                  </div>
                  <h4 className="font-medium mb-2">Speed</h4>
                  <p className="text-sm text-gray-600">
                    Instant verification with tap-to-verify NFC technology
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    🌐
                  </div>
                  <h4 className="font-medium mb-2">Accessibility</h4>
                  <p className="text-sm text-gray-600">
                    Works both online and offline, anywhere in the world
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
