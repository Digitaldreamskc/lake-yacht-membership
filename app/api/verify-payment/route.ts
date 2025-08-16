// app/api/verify-payment/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/database'
import { mintMembershipServer, checkTokenExists } from '@/lib/contracts/mint'
import type { MintParams } from '@/lib/contracts'
import { generateMembershipMetadata, generateMetadataURI } from '@/lib/metadata'

export const runtime = 'nodejs'

// Provide a token URI for the mint (required by your contract)
const TOKEN_URI =
    process.env.MEMBERSHIP_TOKEN_URI ??
    'https://example.com/metadata/default.json' // TODO: set MEMERSHIP_TOKEN_URI in .env.local

async function handleVerify(sessionId: string) {
    try {
        console.log('🔍 Starting verification for session:', sessionId)
        
        // Quick sanity checks for imports
        console.log('🔧 Checking imports...')
        if (!stripe) throw new Error('Stripe not properly imported')
        if (!db) throw new Error('Database not properly imported')
        if (!mintMembershipServer) throw new Error('mintMembershipServer not properly imported')
        if (!generateMembershipMetadata) throw new Error('generateMembershipMetadata not properly imported')
        if (!generateMetadataURI) throw new Error('generateMetadataURI not properly imported')
        console.log('✅ All imports are valid')

        // 1) DB first — if already minted, return it
        console.log('📦 Checking database for existing session...')
        let existing
        try {
            existing = await db.getPaymentSession(sessionId)
            console.log('✅ Database query successful:', existing ? 'found record' : 'no record')
        } catch (err) {
            console.log('❌ Database query failed:', err instanceof Error ? err.message : 'Unknown error')
            console.log('❌ Database error stack:', err instanceof Error ? err.stack : 'No stack')
            existing = null
        }
        
        if (existing?.status === 'completed' && existing?.tokenId) {
            console.log('✅ Found existing completed session:', existing.tokenId)
            return NextResponse.json({
                status: 'completed',
                tokenId: existing.tokenId,
                walletAddress: existing.walletAddress,
                tier: existing.tier,
                email: existing.email,
                metadata: existing.metadata ? JSON.parse(existing.metadata) : null,
                tokenURI: existing.tokenURI,
            })
        }

        // 2) Ask Stripe
        console.log('💳 Checking Stripe session status...')
        let session
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId)
            console.log('💳 Stripe session retrieved successfully')
            console.log('💳 Stripe session payment status:', session.payment_status)
            console.log('💳 Stripe session metadata:', session.metadata)
        } catch (err) {
            console.error('❌ Failed to retrieve Stripe session:', err instanceof Error ? err.message : 'Unknown error')
            console.error('❌ Stripe error stack:', err instanceof Error ? err.stack : 'No stack')
            throw new Error(`Stripe session retrieval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }

        if (session.payment_status !== 'paid') {
            console.log('⏳ Payment not completed yet')
            return NextResponse.json({ status: 'pending', reason: 'unpaid' }, { status: 200 })
        }

        const walletAddress = session.metadata?.walletAddress ?? ''
        const tierStr = '0' // Force tier 0 since client only has one membership tier
        const email = session.metadata?.email ?? ''

        console.log('🔑 Session metadata:', { walletAddress, tierStr, email })

        if (!walletAddress) {
            console.log('❌ Missing wallet address in metadata')
            return NextResponse.json(
                { status: 'error', error: 'Missing walletAddress in metadata.' },
                { status: 200 }
            )
        }

        // 3) Check if wallet already has a token
        console.log('🔍 Checking if wallet already has a membership token...')
        try {
            const existingTokenId = await checkTokenExists(walletAddress)
            if (existingTokenId !== null) {
                console.log('✅ Wallet already has token:', existingTokenId.toString())
                
                // Generate metadata for the existing token
                const metadata = generateMembershipMetadata({
                    tier: Number(tierStr),
                    memberEmail: email,
                    walletAddress,
                    mintedAt: new Date().toISOString()
                })
                
                const tokenURI = generateMetadataURI(metadata)
                
                // Save to database as completed
                await db.updatePaymentSession(sessionId, {
                    status: 'completed',
                    tokenId: Number(existingTokenId),
                    walletAddress,
                    email,
                    tier: Number(tierStr),
                    completedAt: new Date().toISOString(),
                    metadata: JSON.stringify(metadata),
                    tokenURI,
                })

                return NextResponse.json({
                    status: 'completed',
                    tokenId: Number(existingTokenId),
                    walletAddress,
                    tier: Number(tierStr),
                    email,
                    metadata,
                    tokenURI,
                    note: 'Using existing membership token for this wallet'
                })
            }
        } catch (err) {
            console.log('ℹ️  Could not check existing token, proceeding with mint:', err)
        }

        // 4) Double-check again to avoid races with the webhook
        console.log('🔄 Double-checking database...')
        const again = await db.getPaymentSession(sessionId).catch((err: unknown) => {
            console.log('❌ Second database query failed:', err instanceof Error ? err.message : 'Unknown error')
            return null
        })
        
        if (again?.status === 'completed' && again?.tokenId) {
            console.log('✅ Found completed session on second check:', again.tokenId)
            return NextResponse.json({
                status: 'completed',
                tokenId: again.tokenId,
                walletAddress: again.walletAddress,
                tier: again.tier,
                email: again.email,
                metadata: again.metadata ? JSON.parse(again.metadata) : null,
                tokenURI: again.tokenURI,
            })
        }

        // 5) Generate metadata and mint NFT
        console.log('🎨 Generating metadata...')
        let metadata, tokenURI, params, tokenIdBig, tokenId
        
        try {
            metadata = generateMembershipMetadata({
                tier: Number(tierStr),
                memberEmail: email,
                walletAddress,
                mintedAt: new Date().toISOString()
            })
            console.log('✅ Metadata generated successfully:', metadata)
        } catch (err) {
            console.error('❌ Failed to generate metadata:', err)
            throw new Error(`Metadata generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
        
        try {
            tokenURI = generateMetadataURI(metadata)
            console.log('🔗 Generated token URI:', tokenURI)
        } catch (err) {
            console.error('❌ Failed to generate token URI:', err)
            throw new Error(`Token URI generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
        
        params = {
            to: walletAddress,
            tier: Number(tierStr),
            email,
            tokenURI,
        }
        console.log('🪙 Minting NFT with params:', params)

        try {
            tokenIdBig = await mintMembershipServer(params)
            tokenId = tokenIdBig.toString()
            console.log('✅ NFT minted successfully, tokenId:', tokenId)
        } catch (err) {
            console.error('❌ Failed to mint NFT:', err)
            
            // Handle specific "already has token" error
            if (err instanceof Error && err.message.includes('Member already has a token')) {
                return NextResponse.json({
                    status: 'error',
                    error: 'This wallet already has a membership NFT. Each wallet can only have one membership.',
                    code: 'DUPLICATE_MEMBERSHIP'
                }, { status: 400 })
            }
            
            throw new Error(`NFT minting failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }

        // 6) Persist with metadata
        console.log('💾 Updating database with completion status...')
        await db.updatePaymentSession(sessionId, {
            status: 'completed',
            tokenId: Number(tokenId),
            walletAddress,
            email,
            tier: params.tier,
            completedAt: new Date().toISOString(),
            metadata: JSON.stringify(metadata),
            tokenURI,
        })

        console.log('🎉 Verification completed successfully!')
        return NextResponse.json({
            status: 'completed',
            tokenId,
            walletAddress,
            tier: params.tier,
            email,
            metadata,
            tokenURI,
        })
    } catch (error) {
        console.error('💥 Error in handleVerify:', error)
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        
        return NextResponse.json(
            { 
                status: 'error', 
                error: 'Internal server error occurred',
                message: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }
    return handleVerify(sessionId)
}

export async function POST(req: Request) {
    const { sessionId } = await req.json().catch(() => ({}))
    if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }
    return handleVerify(sessionId)
}
