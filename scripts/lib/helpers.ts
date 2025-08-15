// scripts/lib/helpers.ts

import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL } from './constants'
import { MEMBERSHIP_ABI } from '../abi/membershipABI'

export function getContract() {
  if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
    throw new Error('Missing environment variables')
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  return new ethers.Contract(CONTRACT_ADDRESS, MEMBERSHIP_ABI, wallet)
}

export async function waitForTransaction(txHash: string) {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
  const receipt = await provider.waitForTransaction(txHash, 2) // Wait for 2 confirmations
  return receipt
}