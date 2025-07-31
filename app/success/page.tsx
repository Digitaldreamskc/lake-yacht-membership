'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Anchor, ExternalLink, Volume2, VolumeX } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [membershipData, setMembershipData] = useState<any>(null)
    const [audioEnabled, setAudioEnabled] = useState(true)
    const { width, height } = useWindowSize()

    useEffect(() => {
        if (sessionId) {
            verifyPayment()
        }
    }, [sessionId])

    const verifyPayment = async () => {
        // DEV MODE: simulate success if using fake123
        if (process.env.NODE_ENV === 'development' && sessionId === 'fake123') {
            setMembershipData({
                tokenId: '001',
                tier: 'Premium',
                walletAddress: '0xabc...1234',
                image: '/demo-nft.png'
            });
            setStatus('success');
            return;
        }

        try {
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            })

            const data = await response.json()

            if (data.success) {
                setMembershipData(data.membership)
                setStatus('success')
            } else {
                setStatus('error')
            }
        } catch (error) {
            console.error('Payment verification failed:', error)
            setStatus('error')
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <LoadingSpinner size="lg" className="mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Processing Your Membership</h2>
                        <p className="text-gray-600">Please wait while we mint your NFT membership...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <div className="text-red-500 mb-4">
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">❌</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Payment Processing Failed</h2>
                        <p className="text-gray-600">There was an issue processing your membership. Please contact support.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Confetti width={width} height={height} numberOfPieces={400} recycle={false} />
            {audioEnabled && (
                <audio autoPlay loop controls={false} style={{ display: 'none' }}>
                    <source src="/come-sail-away.mp3" type="audio/mpeg" />
                </audio>
            )}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-full"
                            aria-label="Toggle sound"
                        >
                            {audioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className="mb-8">
                        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to the Club!</h1>
                        <p className="text-xl text-gray-600">Your membership has been successfully created</p>
                    </div>

                    <Card className="text-left">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Anchor className="h-6 w-6 text-blue-600" />
                                <span>Your Membership Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {membershipData && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-500">Token ID</span>
                                            <p className="font-semibold">#{membershipData.tokenId}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Tier</span>
                                            <p className="font-semibold">{membershipData.tier}</p>
                                        </div>
                                    </div>

                                    {Boolean(membershipData.image) && membershipData.image.trim() !== "" ? (
                                        <img
                                            src={membershipData.image}
                                            alt="Your NFT"
                                            className="rounded-xl w-64 mx-auto"
                                        />
                                    ) : (
                                        <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-xl mx-auto" />
                                    )}


                                    <div className="pt-4 border-t">
                                        <h3 className="font-semibold mb-2">What's Next?</h3>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            <li>• Check your email for additional club information</li>
                                            <li>• Your NFT membership is now in your Privy wallet</li>
                                            <li>• Visit the club to activate your physical privileges</li>
                                            <li>• Join our members only community</li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-8 flex justify-center space-x-4">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <a href="/">
                                Return Home
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
                                target="_blank"
                                rel="noopener noreferrer">
                                View on BaseScan <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}