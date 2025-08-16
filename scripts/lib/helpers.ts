// scripts/lib/helpers.ts

import { createPublicClient, http, createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import { MEMBERSHIP_ABI } from '../abi/membershipABI'

export function getContract() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const PRIVATE_KEY = process.env.CONTRACT_PRIVATE_KEY
  const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org'
  
  if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
    throw new Error('Missing environment variables')
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL)
  })
  
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL)
  })
  
  return { publicClient, walletClient, contractAddress: CONTRACT_ADDRESS }
}

export async function waitForTransaction(txHash: string) {
  const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org'
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL)
  })
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` })
  return receipt
}