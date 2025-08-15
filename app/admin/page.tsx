'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCards } from "@/components/admin/stats-cards"
import { ManualMintDialog } from "@/components/admin/manual-mint-dialog"
import { MembershipCard } from "@/components/membership-card"
import { NFCCardManager } from "@/components/admin/nfc-card-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembershipData } from "@/lib/types"
import { Anchor, Settings } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminDashboard() {
  const [memberships, setMemberships] = useState<MembershipData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalRevenue: 0,
    monthlyGrowth: 12,
    activeMembers: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      setMemberships(data.memberships || [])
      setStats({
        totalMembers: data.totalMembers || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyGrowth: data.monthlyGrowth || 12,
        activeMembers: data.activeMembers || 0
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualMint = async (email: string, walletAddress: string, tier: number) => {
    try {
      const response = await fetch('/api/admin/manual-mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          walletAddress,
          tier
        })
      })

      if (response.ok) {
        await loadDashboardData() // Refresh data
      } else {
        throw new Error('Failed to mint membership')
      }
    } catch (error) {
      console.error('Manual mint failed:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Anchor className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yacht Club Admin</h1>
              <p className="text-gray-600">Manage memberships and track performance</p>
            </div>
          </div>
          <ManualMintDialog onMint={handleManualMint} />
        </div>

        <StatsCards
          totalMembers={stats.totalMembers}
          totalRevenue={stats.totalRevenue}
          monthlyGrowth={stats.monthlyGrowth}
          activeMembers={stats.activeMembers}
        />

        <Tabs defaultValue="members" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="nfc-cards">NFC Cards</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                {memberships.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No memberships found. Use the manual mint button to create the first membership.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {memberships.map((membership) => (
                      <MembershipCard key={membership.tokenId} membership={membership} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="nfc-cards" className="mt-6">
            <NFCCardManager onCardLinked={(cardData) => {
              console.log('NFC card linked:', cardData)
              // TODO: Update UI or refresh data
            }} />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Contract Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-2">Contract Address</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not configured'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium mb-2">Network</h3>
                    <p className="text-sm text-gray-600">Base Mainnet (Chain ID: 8453)</p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-medium mb-2">Royalty Rate</h3>
                    <p className="text-sm text-gray-600">10% on secondary sales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}