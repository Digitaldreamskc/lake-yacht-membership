// components/admin/nfc-card-manager.tsx
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { config } from '@/lib/config'
import { updateMetadataWithNFCCard } from '@/lib/metadata'

interface NFCCard {
  id: string
  cardType: string
  serialNumber: string
  linkedAt: string
  isActive: boolean
  tokenId?: string
  memberAddress?: string
}

interface NFCCardManagerProps {
  onCardLinked: (cardData: NFCCard) => void
}

export function NFCCardManager({ onCardLinked }: NFCCardManagerProps) {
  const [cards, setCards] = useState<NFCCard[]>([])
  const [newCard, setNewCard] = useState({
    cardId: '',
    serialNumber: '',
    cardType: 'Standard',
    tokenId: '',
    memberAddress: ''
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddCard = async () => {
    if (!newCard.cardId || !newCard.serialNumber || !newCard.cardType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const cardData: NFCCard = {
        id: newCard.cardId,
        cardType: newCard.cardType,
        serialNumber: newCard.serialNumber,
        linkedAt: new Date().toISOString(),
        isActive: true,
        tokenId: newCard.tokenId || undefined,
        memberAddress: newCard.memberAddress || undefined
      }

      // TODO: Call smart contract to link NFC card
      // await linkNFCCard(cardData.tokenId, cardData.id, cardData.serialNumber, cardData.cardType)

      setCards(prev => [...prev, cardData])
      onCardLinked(cardData)

      // Reset form
      setNewCard({
        cardId: '',
        serialNumber: '',
        cardType: 'Standard',
        tokenId: '',
        memberAddress: ''
      })

      toast({
        title: "Success",
        description: "NFC card added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add NFC card: ${error}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCardStatus = async (cardId: string) => {
    try {
      setCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, isActive: !card.isActive }
          : card
      ))

      // TODO: Call smart contract to update card status
      // await updateCardStatus(cardId, !cards.find(c => c.id === cardId)?.isActive)

      toast({
        title: "Success",
        description: "Card status updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update card status: ${error}`,
        variant: "destructive"
      })
    }
  }

  const handleUnlinkCard = async (cardId: string) => {
    try {
      const card = cards.find(c => c.id === cardId)
      if (!card?.tokenId) return

      // TODO: Call smart contract to unlink card
      // await unlinkNFCCard(card.tokenId)

      setCards(prev => prev.map(c => 
        c.id === cardId 
          ? { ...c, tokenId: undefined, memberAddress: undefined }
          : c
      ))

      toast({
        title: "Success",
        description: "Card unlinked successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to unlink card: ${error}`,
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFC Card Management</CardTitle>
        <CardDescription>
          Link physical NFC cards to digital membership NFTs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Card Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add New NFC Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardId">Card ID</Label>
              <Input
                id="cardId"
                value={newCard.cardId}
                onChange={(e) => setNewCard(prev => ({ ...prev, cardId: e.target.value }))}
                placeholder="NFC_001_ABC123"
              />
            </div>
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={newCard.serialNumber}
                onChange={(e) => setNewCard(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="SN123456"
              />
            </div>
            <div>
              <Label htmlFor="cardType">Card Type</Label>
              <Select
                value={newCard.cardType}
                onValueChange={(value) => setNewCard(prev => ({ ...prev, cardType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(config.nfc.cardTypes).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tokenId">Token ID (Optional)</Label>
              <Input
                id="tokenId"
                value={newCard.tokenId}
                onChange={(e) => setNewCard(prev => ({ ...prev, tokenId: e.target.value }))}
                placeholder="1"
                type="number"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="memberAddress">Member Address (Optional)</Label>
              <Input
                id="memberAddress"
                value={newCard.memberAddress}
                onChange={(e) => setNewCard(prev => ({ ...prev, memberAddress: e.target.value }))}
                placeholder="0x..."
              />
            </div>
          </div>
          <Button 
            onClick={handleAddCard} 
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? "Adding..." : "Add NFC Card"}
          </Button>
        </div>

        {/* Cards List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">NFC Cards ({cards.length})</h3>
          {cards.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No NFC cards added yet. Add your first card above.
            </p>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${card.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium">{card.id}</p>
                        <p className="text-sm text-gray-600">
                          {card.cardType} • SN: {card.serialNumber}
                        </p>
                        {card.tokenId && (
                          <p className="text-sm text-blue-600">
                            Linked to Token #{card.tokenId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCardStatus(card.id)}
                    >
                      {card.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    {card.tokenId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlinkCard(card.id)}
                      >
                        Unlink
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
