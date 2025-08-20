'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MemberTier } from "@/lib/types"
import { Plus } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ManualMintDialogProps {
  onMint: (email: string, walletAddress: string, tier: number) => Promise<void>
}

export function ManualMintDialog({ onMint }: ManualMintDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    walletAddress: '',
    tier: '0'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.walletAddress) return

    setLoading(true)
    try {
      await onMint(formData.email, formData.walletAddress, parseInt(formData.tier))
      setFormData({ email: '', walletAddress: '', tier: '0' })
      setOpen(false)
    } catch (error) {
      console.error('Failed to mint:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Manual Mint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Mint Membership</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Member Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="member@example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="wallet">Wallet Address</Label>
            <Input
              id="wallet"
              value={formData.walletAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
              placeholder="0x..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tier">Membership Tier</Label>
            <Select
              value={formData.tier}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, tier: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Standard ($150)</SelectItem>
                <SelectItem value="1">Premium ($150)</SelectItem>
                <SelectItem value="2">Elite ($150)</SelectItem>
                <SelectItem value="3">Lifetime ($150)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Minting...
              </>
            ) : (
              'Mint Membership'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}