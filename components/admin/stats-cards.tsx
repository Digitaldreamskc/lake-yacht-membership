'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, TrendingUp, Anchor } from "lucide-react"

interface StatsCardsProps {
  totalMembers: number
  totalRevenue: number
  monthlyGrowth: number
  activeMembers: number
}

export function StatsCards({ totalMembers, totalRevenue, monthlyGrowth, activeMembers }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Total Members</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{totalMembers}</div>
          <p className="text-xs text-blue-600">
            {activeMembers} active memberships
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">${totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-green-600">
            From membership sales
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Monthly Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">+{monthlyGrowth}%</div>
          <p className="text-xs text-purple-600">
            Compared to last month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800">Club Status</CardTitle>
          <Anchor className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">Active</div>
          <p className="text-xs text-yellow-600">
            All systems operational
          </p>
        </CardContent>
      </Card>
    </div>
  )
}