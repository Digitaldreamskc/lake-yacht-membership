'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MemberTier, MembershipData } from "@/lib/types"
import { Calendar, Mail, Anchor } from "lucide-react"

interface MembershipCardProps {
  membership: MembershipData
}

const tierNames = {
  [MemberTier.Standard]: "Standard",
  [MemberTier.Premium]: "Premium", 
  [MemberTier.Elite]: "Elite",
  [MemberTier.Lifetime]: "Lifetime"
}

const tierColors = {
  [MemberTier.Standard]: "bg-gray-100 text-gray-800",
  [MemberTier.Premium]: "bg-blue-100 text-blue-800",
  [MemberTier.Elite]: "bg-purple-100 text-purple-800", 
  [MemberTier.Lifetime]: "bg-yellow-100 text-yellow-800"
}

export function MembershipCard({ membership }: MembershipCardProps) {
  const tierName = tierNames[membership.memberInfo.tier]
  const tierColor = tierColors[membership.memberInfo.tier]
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Anchor className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Member #{membership.tokenId}</CardTitle>
          </div>
          <Badge className={tierColor}>{tierName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{membership.memberInfo.email}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Joined {new Date(Number(membership.memberInfo.mintedAt) * 1000).toLocaleDateString()}
          </span>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 font-mono">
            {membership.owner.slice(0, 6)}...{membership.owner.slice(-4)}
          </p>
          {!membership.memberInfo.active && (
            <Badge variant="destructive" className="mt-2">Inactive</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}