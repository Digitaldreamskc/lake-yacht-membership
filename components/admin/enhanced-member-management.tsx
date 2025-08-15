'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  CreditCard,
  Activity,
  Calendar
} from 'lucide-react'
import { MembershipData, MemberTier } from '@/lib/types'

interface EnhancedMemberManagementProps {
  memberships: MembershipData[]
  onMemberUpdate: (tokenId: number, updates: Partial<MembershipData>) => void
  onBulkOperation: (operation: string, selectedIds: number[]) => void
}

export function EnhancedMemberManagement({ 
  memberships, 
  onMemberUpdate, 
  onBulkOperation 
}: EnhancedMemberManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [sortBy, setSortBy] = useState<string>('tokenId')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and search members
  const filteredMembers = memberships.filter(member => {
    const matchesSearch = 
      member.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.tokenId.toString().includes(searchTerm)
    
    const matchesTier = selectedTier === 'all' || member.memberInfo.tier.toString() === selectedTier
    const matchesStatus = selectedStatus === 'all' || member.memberInfo.active.toString() === selectedStatus
    
    return matchesSearch && matchesTier && matchesStatus
  })

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'tokenId':
        aValue = a.tokenId
        bValue = b.tokenId
        break
      case 'email':
        aValue = a.memberInfo.email
        bValue = b.memberInfo.email
        break
      case 'tier':
        aValue = a.memberInfo.tier
        bValue = b.memberInfo.tier
        break
      case 'mintedAt':
        aValue = Number(a.memberInfo.mintedAt)
        bValue = Number(b.memberInfo.mintedAt)
        break
      default:
        aValue = a.tokenId
        bValue = b.tokenId
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

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

  const handleSelectAll = () => {
    if (selectedMembers.size === sortedMembers.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(sortedMembers.map(m => m.tokenId)))
    }
  }

  const handleBulkOperation = (operation: string) => {
    if (selectedMembers.size === 0) return
    
    onBulkOperation(operation, Array.from(selectedMembers))
    setSelectedMembers(new Set())
  }

  const exportMemberData = () => {
    const csvData = sortedMembers.map(member => ({
      'Token ID': member.tokenId,
      'Wallet Address': member.owner,
      'Email': member.memberInfo.email,
      'Tier': getTierName(member.memberInfo.tier),
      'Active': member.memberInfo.active ? 'Yes' : 'No',
      'Minted At': new Date(Number(member.memberInfo.mintedAt) * 1000).toISOString(),
      'Token URI': member.tokenURI || ''
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yacht-club-members-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search & Filter Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by ID, email, or wallet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Tiers</option>
                <option value="0">Standard</option>
                <option value="1">Premium</option>
                <option value="2">Elite</option>
                <option value="3">Lifetime</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">View Mode</label>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedMembers.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedMembers.size} member(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMembers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('activate')}
                >
                  Activate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('deactivate')}
                >
                  Deactivate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('export')}
                >
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredMembers.length} of {memberships.length} members
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={exportMemberData}
            disabled={sortedMembers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Members Display */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedMembers.size === sortedMembers.length && sortedMembers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedMembers.map((member) => (
                    <tr key={member.tokenId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(member.tokenId)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedMembers)
                            if (e.target.checked) {
                              newSelected.add(member.tokenId)
                            } else {
                              newSelected.delete(member.tokenId)
                            }
                            setSelectedMembers(newSelected)
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{member.tokenId}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.memberInfo.email}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {member.owner.slice(0, 8)}...{member.owner.slice(-6)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTierColor(member.memberInfo.tier)}>
                          {getTierName(member.memberInfo.tier)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={member.memberInfo.active ? 'default' : 'secondary'}>
                          {member.memberInfo.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(Number(member.memberInfo.mintedAt) * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedMembers.map((member) => (
            <Card key={member.tokenId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{member.tokenId}</CardTitle>
                  <input
                    type="checkbox"
                    checked={selectedMembers.has(member.tokenId)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedMembers)
                      if (e.target.checked) {
                        newSelected.add(member.tokenId)
                      } else {
                        newSelected.delete(member.tokenId)
                      }
                      setSelectedMembers(newSelected)
                    }}
                    className="rounded border-gray-300"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {member.memberInfo.email}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {member.owner.slice(0, 8)}...{member.owner.slice(-6)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getTierColor(member.memberInfo.tier)}>
                    {getTierName(member.memberInfo.tier)}
                  </Badge>
                  <Badge variant={member.memberInfo.active ? 'default' : 'secondary'}>
                    {member.memberInfo.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500">
                  Minted: {new Date(Number(member.memberInfo.mintedAt) * 1000).toLocaleDateString()}
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}



