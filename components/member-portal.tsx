'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Activity,
  Calendar,
  Shield,
  Star,
  QrCode,
  Smartphone
} from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { YACHT_CLUB_CONTRACT } from '@/lib/contracts'
import { MemberTier } from '@/lib/types'

interface MemberPortalProps {
  className?: string
}

interface MembershipStatus {
  tokenId: string
  tier: MemberTier
  memberAddress: string
  nfcCardLinked: boolean
  nfcCardId?: string
  lastVerified: string
  mintedAt: string
  active: boolean
}

export function MemberPortal({ className }: MemberPortalProps) {
  const { user, authenticated } = usePrivy()
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const getTierName = (tier: MemberTier): string => {
    const tierNames = ['Standard', 'Premium', 'Elite', 'Lifetime']
    return tierNames[tier] || 'Unknown'
  }

  const getTierColor = (tier: MemberTier): string => {
    const colors = {
      [MemberTier.Standard]: 'bg-blue-100 text-blue-800',
      [MemberTier.Premium]: 'bg-purple-100 text-purple-800',
      [MemberTier.Elite]: 'bg-yellow-100 text-yellow-800',
      [MemberTier.Lifetime]: 'bg-green-100 text-green-800'
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  const getTierBenefits = (tier: MemberTier): string[] => {
    const benefits = {
      [MemberTier.Standard]: [
        'Access to club facilities',
        'Basic member events',
        'Standard support'
      ],
      [MemberTier.Premium]: [
        'All Standard benefits',
        'Priority event access',
        'Guest privileges (2 guests)',
        'Premium support'
      ],
      [MemberTier.Elite]: [
        'All Premium benefits',
        'VIP event access',
        'Guest privileges (5 guests)',
        'Concierge service',
        'Exclusive member events'
      ],
      [MemberTier.Lifetime]: [
        'All Elite benefits',
        'Lifetime membership',
        'Unlimited guest privileges',
        'Priority reservations',
        'Founding member status'
      ]
    }
    return benefits[tier] || []
  }

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
          tier: memberInfo.tier,
          memberAddress: user.wallet.address,
          nfcCardLinked,
          lastVerified: new Date().toISOString(),
          mintedAt: new Date(Number(memberInfo.mintedAt) * 1000).toISOString(),
          active: memberInfo.active
        })
      }
    } catch (error) {
      console.error('Failed to check membership status:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const downloadNFCData = () => {
    if (!membershipStatus) return

    const nfcData = {
      memberId: membershipStatus.tokenId,
      walletAddress: membershipStatus.memberAddress,
      tier: getTierName(membershipStatus.tier),
      memberSince: membershipStatus.mintedAt,
      nfcCardId: membershipStatus.nfcCardId || 'Not linked',
      lastVerified: membershipStatus.lastVerified
    }

    const jsonString = JSON.stringify(nfcData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yacht-club-nfc-data-${membershipStatus.tokenId}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadQRCode = () => {
    if (!membershipStatus) return

    // Create a simple text-based QR code data
    const qrData = `LSYC:${membershipStatus.tokenId}:${membershipStatus.memberAddress}`
    
    // For now, just download the data as text
    // In production, you'd generate an actual QR code image
    const blob = new Blob([qrData], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yacht-club-qr-${membershipStatus.tokenId}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      checkMembershipStatus()
    }
  }, [authenticated, user?.wallet?.address])

  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Your Membership</h3>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view your membership details and access NFC data.
          </p>
          <Button disabled>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          My Membership Portal
        </h2>
        <p className="text-gray-600">
          View your membership status, download NFC data, and manage your profile
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nfc-data">NFC Data</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Membership Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-6">
                  {/* Status Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Token ID</p>
                          <p className="text-2xl font-bold text-blue-600">
                            #{membershipStatus.tokenId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Star className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">Tier</p>
                          <Badge className={`text-sm ${getTierColor(membershipStatus.tier)}`}>
                            {getTierName(membershipStatus.tier)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-900">Member Since</p>
                          <p className="text-sm text-purple-600">
                            {new Date(membershipStatus.mintedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Information */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Wallet Address</p>
                        <p className="text-sm text-gray-600 font-mono">
                          {membershipStatus.memberAddress}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(membershipStatus.memberAddress, 'wallet')}
                      >
                        {copied === 'wallet' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* NFC Card Status */}
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${membershipStatus.nfcCardLinked ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-medium text-yellow-900 mb-1">NFC Card Status</p>
                          <p className="text-sm text-yellow-700">
                            {membershipStatus.nfcCardLinked ? 'Card Linked' : 'No Card Linked'}
                          </p>
                        </div>
                      </div>
                      {membershipStatus.nfcCardId && (
                        <Badge variant="outline">{membershipStatus.nfcCardId}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NFC Data Tab */}
        <TabsContent value="nfc-data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>NFC Card Data & Downloads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!membershipStatus ? (
                <div className="text-center py-8 text-gray-500">
                  Please check your membership status first
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">NFC Data Export</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Download your NFC card data in JSON format for integration with physical cards.
                        </p>
                        <Button onClick={downloadNFCData} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download NFC Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">QR Code Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Download QR code data for easy verification and access.
                        </p>
                        <Button onClick={downloadQRCode} className="w-full">
                          <QrCode className="h-4 w-4 mr-2" />
                          Download QR Data
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* NFC Data Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>NFC Data Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{JSON.stringify({
                          memberId: membershipStatus.tokenId,
                          walletAddress: membershipStatus.memberAddress,
                          tier: getTierName(membershipStatus.tier),
                          memberSince: membershipStatus.mintedAt,
                          nfcCardId: membershipStatus.nfcCardId || 'Not linked',
                          lastVerified: membershipStatus.lastVerified
                        }, null, 2)}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Your Membership Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!membershipStatus ? (
                <div className="text-center py-8 text-gray-500">
                  Please check your membership status first
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {getTierName(membershipStatus.tier)} Membership Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getTierBenefits(membershipStatus.tier).map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Access Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge className={getTierColor(membershipStatus.tier)}>
                          {getTierName(membershipStatus.tier)}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Guest Privileges</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-2xl font-bold text-blue-600">
                          {membershipStatus.tier === MemberTier.Standard ? '0' :
                           membershipStatus.tier === MemberTier.Premium ? '2' :
                           membershipStatus.tier === MemberTier.Elite ? '5' : '∞'}
                        </span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Support Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-sm text-gray-600">
                          {membershipStatus.tier === MemberTier.Standard ? 'Standard' :
                           membershipStatus.tier === MemberTier.Premium ? 'Premium' :
                           membershipStatus.tier === MemberTier.Elite ? 'Concierge' : 'VIP'}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Profile & Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!membershipStatus ? (
                <div className="text-center py-8 text-gray-500">
                  Please check your membership status first
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-600">{user?.email?.address || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                          <p className="text-sm text-gray-600 font-mono">
                            {membershipStatus.memberAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Membership Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Token ID</label>
                          <p className="text-sm text-gray-600">#{membershipStatus.tokenId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Member Since</label>
                          <p className="text-sm text-gray-600">
                            {new Date(membershipStatus.mintedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Status</label>
                          <Badge variant={membershipStatus.active ? 'default' : 'secondary'}>
                            {membershipStatus.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        Update Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        Change Email
                      </Button>
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}



