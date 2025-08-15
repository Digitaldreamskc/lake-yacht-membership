// Contract addresses and ABIs
export const YACHT_CLUB_CONTRACT = {
    address: (() => {
        const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
        if (!address) {
            // Return a placeholder address for development
            return '0x0000000000000000000000000000000000000000' as `0x${string}`
        }
        if (!address.startsWith('0x') || address.length !== 42) {
            throw new Error('Invalid contract address format')
        }
        return address as `0x${string}`
    })(),
    abi: [
        {
            inputs: [
                { name: "_authorizedMinter", type: "address" },
                { name: "_royaltyRecipient", type: "address" },
                { name: "_royaltyFraction", type: "uint96" }
            ],
            stateMutability: "nonpayable",
            type: "constructor"
        },
        {
            inputs: [
                { name: "to", type: "address" },
                { name: "tier", type: "uint8" },
                { name: "email", type: "string" },
                { name: "tokenURI", type: "string" }
            ],
            name: "mintMembership",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [{ name: "tokenId", type: "uint256" }],
            name: "getMemberInfo",
            outputs: [
                {
                    components: [
                        { name: "tier", type: "uint8" },
                        { name: "mintedAt", type: "uint256" },
                        { name: "email", type: "string" },
                        { name: "active", type: "bool" }
                    ],
                    name: "",
                    type: "tuple"
                }
            ],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [{ name: "member", type: "address" }],
            name: "getTokenIdByMember",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [],
            name: "totalSupply",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [{ name: "account", type: "address" }],
            name: "isMember",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "view",
            type: "function"
        },
        // NFC Card Management Functions
        {
            inputs: [
                { name: "tokenId", type: "uint256" },
                { name: "cardId", type: "string" },
                { name: "serialNumber", type: "string" },
                { name: "cardType", type: "string" }
            ],
            name: "linkNFCCard",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [{ name: "tokenId", type: "uint256" }],
            name: "unlinkNFCCard",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [{ name: "tokenId", type: "uint256" }],
            name: "deactivateNFCCard",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [{ name: "tokenId", type: "uint256" }],
            name: "reactivateNFCCard",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [{ name: "cardId", type: "string" }],
            name: "getNFCCardInfo",
            outputs: [
                { name: "tokenId", type: "uint256" },
                { name: "isActive", type: "bool" },
                { name: "cardType", type: "string" }
            ],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [{ name: "cardId", type: "string" }],
            name: "verifyNFCCard",
            outputs: [
                { name: "isValid", type: "bool" },
                { name: "memberAddress", type: "address" },
                { name: "tier", type: "uint8" }
            ],
            stateMutability: "view",
            type: "function"
        },
        // Add Transfer event for proper event listening
        {
            anonymous: false,
            inputs: [
                { indexed: true, name: "from", type: "address" },
                { indexed: true, name: "to", type: "address" },
                { indexed: true, name: "tokenId", type: "uint256" }
            ],
            name: "Transfer",
            type: "event"
        }
    ] as const
}

export const BASE_CHAIN_ID = 84532 // Base Sepolia testnet
export const BASE_RPC_URL = "https://sepolia.base.org"

// Contract interaction utilities
export class ContractError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly txHash?: string
    ) {
        super(message)
        this.name = 'ContractError'
    }
}

// Type definitions for better TypeScript support
export interface NFCCard {
    cardId: string
    serialNumber: string
    linkedAt: bigint
    isActive: boolean
    cardType: string
}

export interface MemberInfo {
    tier: number
    mintedAt: bigint
    email: string
    active: boolean
    nfcCard: NFCCard
    hasNFCCard: boolean
}

export interface MintParams {
    to: string
    tier: number
    email: string
    tokenURI: string
}

export interface NFCCardParams {
    tokenId: bigint
    cardId: string
    serialNumber: string
    cardType: string
}

// NFC Card utility functions
export async function linkNFCCard(
    contract: any,
    params: NFCCardParams
): Promise<void> {
    try {
        const tx = await contract.linkNFCCard(
            params.tokenId,
            params.cardId,
            params.serialNumber,
            params.cardType
        )
        await tx.wait()
    } catch (error: any) {
        throw new ContractError(
            `Failed to link NFC card: ${error.message}`,
            error.code,
            error.transactionHash
        )
    }
}

export async function verifyNFCCard(
    contract: any,
    cardId: string
): Promise<{ isValid: boolean; memberAddress: string; tier: number }> {
    try {
        const result = await contract.verifyNFCCard(cardId)
        return {
            isValid: result[0],
            memberAddress: result[1],
            tier: result[2]
        }
    } catch (error: any) {
        throw new ContractError(
            `Failed to verify NFC card: ${error.message}`,
            error.code
        )
    }
}