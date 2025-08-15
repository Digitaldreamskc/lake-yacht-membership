'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Anchor, ExternalLink } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

type VerifyResponse =
    | { status: 'pending'; reason?: string }
    | { status: 'completed'; tokenId: string | number; walletAddress: string; tier: string; email?: string }
    | { status: 'error'; error: string }

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = useMemo(() => searchParams.get('session_id') || '', [searchParams])
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [membershipData, setMembershipData] = useState<null | {
        tokenId: string | number
        tier: string
        walletAddress: string
        email?: string
    }>(null)
    const { width, height } = useWindowSize()

    useEffect(() => {
        if (!sessionId) {
            setStatus('error')
            return
        }

        let cancelled = false
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

        const run = async () => {
            // poll up to ~60s (15 attempts * 4s)
            for (let i = 0; i < 15; i++) {
                try {
                    const res = await fetch(
                        `/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`,
                        { cache: 'no-store' }
                    )

                    if (!res.ok) {
                        // transient/network or 4xx from API — wait and retry
                        await sleep(3000)
                        continue
                    }

                    const data: VerifyResponse = await res.json()
                    if (cancelled) return

                    if (data.status === 'completed') {
                        setMembershipData({
                            tokenId: data.tokenId,
                            tier: data.tier,
                            walletAddress: data.walletAddress,
                            email: 'email' in data ? data.email : undefined,
                        })
                        setStatus('success')
                        return
                    }

                    if (data.status === 'error') {
                        console.error('Verify error:', data.error)
                        setStatus('error')
                        return
                    }

                    // still pending
                    await sleep(4000)
                } catch (e) {
                    console.error('Verify request failed', e)
                    await sleep(3000)
                }
            }

            // timed out
            setStatus('error')
        }

        run()
        return () => {
            cancelled = true
        }
    }, [sessionId])

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
                        <h2 className="text-xl font-semibold mb-2">Payment Verification Issue</h2>
                        <p className="text-gray-600">
                            If you paid successfully, refresh in a moment or contact support.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // success
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
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
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-500">Wallet</span>
                                            <p className="font-mono break-all">{membershipData.walletAddress}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h3 className="font-semibold mb-2">What's Next?</h3>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            <li>• Check your email for additional club information</li>
                                            <li>• Your NFT membership is now in your wallet</li>
                                            <li>• Visit the club to activate your physical privileges</li>
                                            <li>• Join our members-only community</li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-8 flex justify-center space-x-4">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <a href="/">Return Home</a>
                        </Button>
                        {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS && (
                            <Button variant="outline" asChild>
                                <a
                                    href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View on BaseScan <ExternalLink className="h-4 w-4 ml-1" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
