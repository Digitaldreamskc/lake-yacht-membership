// scripts/abi/membershipABI.ts
// ABI remains the same
export const MEMBERSHIP_ABI = [
    // ... same ABI as before
] as const;
```

```typescript
// scripts/lib/helpers.ts
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL } from './constants'
import { MEMBERSHIP_ABI } from '../abi/membershipABI'

export async function getContract() {
    if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
        throw new Error('Missing environment variables')
    }

    // Updated for ethers v6
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    return new ethers.Contract(CONTRACT_ADDRESS, MEMBERSHIP_ABI, wallet)
}

export async function waitForTransaction(txHash: string) {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const receipt = await provider.waitForTransaction(txHash, 2) // Wait for 2 confirmations
    return receipt
}
```

```typescript
// scripts/mint/membership.ts
import { ethers } from 'ethers'
import { getContract, waitForTransaction } from '../lib/helpers'
import { TIER_NAMES } from '../lib/constants'
import type { MintingParams, MintingResult, MintingError } from './types'

export async function mintMembership({
    walletAddress,
    tier,
    metadata
}: MintingParams): Promise<MintingResult> {
    try {
        // Get contract instance
        const contract = await getContract()

        // Validate tier
        if (!(tier in TIER_NAMES)) {
            throw new Error(`Invalid tier: ${tier}`)
        }

        // Validate wallet address
        if (!ethers.isAddress(walletAddress)) { // Updated for ethers v6
            throw new Error('Invalid wallet address')
        }

        // Mint token
        console.log(`Minting ${TIER_NAMES[tier]} membership for ${walletAddress}...`)
        const tx = await contract.mint(walletAddress, tier, {
            gasLimit: 300000 // Adjust based on your contract
        })

        // Wait for confirmation
        console.log(`Transaction sent: ${tx.hash}`)
        const receipt = await waitForTransaction(tx.hash)

        if (!receipt?.status) {
            throw new Error('Transaction failed')
        }

        // Get token ID from event logs
        const mintEvent = receipt.logs
            .map(log => {
                try {
                    return contract.interface.parseLog({
                        topics: log.topics,
                        data: log.data
                    })
                } catch {
                    return null
                }
            })
            .find(event => event?.name === 'Transfer')

        if (!mintEvent) {
            throw new Error('Could not find mint event')
        }

        const tokenId = mintEvent.args[2].toString() // TokenId is the third argument in Transfer event

        // Set token URI if metadata provided
        if (metadata) {
            // You might want to upload to IPFS first
            const metadataUri = `ipfs://${await uploadToIPFS(metadata)}`
            const uriTx = await contract.setTokenURI(tokenId, metadataUri)
            await waitForTransaction(uriTx.hash)
        }

        return {
            tokenId,
            transactionHash: receipt.hash,
            tier
        }
    } catch (error: any) {
        const mintError: MintingError = new Error(
            error.message || 'Failed to mint membership'
        )
        mintError.code = error.code
        mintError.transactionHash = error.transactionHash
        throw mintError
    }
}

// Helper function to upload metadata to IPFS
async function uploadToIPFS(metadata: any) {
    // Implement IPFS upload
    // You can use services like Pinata, web3.storage, or your own IPFS node
    throw new Error('IPFS upload not implemented')
}
```

```typescript
// scripts/contract/deploy.ts
import { ethers } from 'ethers'
import { MEMBERSHIP_ABI } from '../abi/membershipABI'
import { RPC_URL, PRIVATE_KEY } from '../lib/constants'

async function deploy() {
    if (!PRIVATE_KEY || !RPC_URL) {
        throw new Error('Missing environment variables')
    }

    // Updated for ethers v6
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

    console.log('Deploying membership contract...')

    const ContractFactory = new ethers.ContractFactory(
        MEMBERSHIP_ABI,
        BYTECODE, // You'll need to add your contract bytecode
        wallet
    )

    const contract = await ContractFactory.deploy()
    await contract.waitForDeployment() // Updated for ethers v6

    const address = await contract.getAddress() // Updated for ethers v6
    console.log('Contract deployed to:', address)
    return address
}

if (require.main === module) {
    deploy()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}