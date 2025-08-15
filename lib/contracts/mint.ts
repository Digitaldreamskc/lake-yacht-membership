// lib/contracts/mint.ts
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { YACHT_CLUB_CONTRACT, ContractError, type MintParams } from '../contracts'
import { logger } from '@/lib/logger'

/**
 * Client-side minting function using user's connected wallet
 * This is the recommended approach for web3 applications
 */
export async function mintMembershipClient(
  wallet: any, // Privy wallet instance
  params: MintParams
): Promise<bigint> {
  if (!wallet) {
    throw new ContractError('No wallet connected')
  }

  try {
    // Switch to Base Sepolia network if needed
    await wallet.switchChain(baseSepolia.id)
    
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom(await wallet.getEthereumProvider())
    })

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })

    logger.info('Initiating client-side mint', { params })

    // Simulate the transaction first to catch errors early
    const { request } = await publicClient.simulateContract({
      address: YACHT_CLUB_CONTRACT.address,
      abi: YACHT_CLUB_CONTRACT.abi,
      functionName: 'mintMembership',
      args: [params.to, params.tier, params.email, params.tokenURI],
      account: wallet.address as `0x${string}`
    })

    // Execute the transaction
    const txHash = await walletClient.writeContract(request)
    
    logger.info('Mint transaction sent', { txHash, walletAddress: params.to })

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 2
    })

    // Parse logs to get tokenId from Transfer event
    const logs = await publicClient.getLogs({
      address: YACHT_CLUB_CONTRACT.address,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: true, name: 'to', type: 'address' },
          { indexed: true, name: 'tokenId', type: 'uint256' }
        ]
      },
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber
    })

    const transferLog = logs.find(log => 
      log.args.to?.toLowerCase() === params.to.toLowerCase() && 
      log.args.from === '0x0000000000000000000000000000000000000000'
    )

    if (!transferLog || !transferLog.args.tokenId) {
      throw new ContractError('Transfer event not found in transaction receipt')
    }

    const tokenId = transferLog.args.tokenId

    logger.info('Mint completed successfully', { 
      tokenId: tokenId.toString(), 
      txHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString()
    })

    return tokenId

  } catch (error: any) {
    logger.error('Client-side mint failed', { 
      error: error.message, 
      code: error.code,
      params 
    })
    
    // Re-throw with more context
    throw new ContractError(
      `Failed to mint membership: ${error.message}`,
      error.code,
      error.transactionHash
    )
  }
}

/**
 * Server-side minting function using private key
 * Only use this for specific backend operations where user interaction isn't possible
 */
export async function mintMembershipServer(
  params: MintParams
): Promise<bigint> {
  const privateKey = process.env.CONTRACT_PRIVATE_KEY
  
  if (!privateKey) {
    throw new ContractError('Private key not configured for server-side minting')
  }

  // Ensure private key is properly formatted for Viem
  const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}` as `0x${string}`
  
  const account = privateKeyToAccount(formattedPrivateKey)
  
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account
  })

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  })

  try {
    logger.info('Initiating server-side mint', { params })

    // Simulate first
    await publicClient.simulateContract({
      address: YACHT_CLUB_CONTRACT.address,
      abi: YACHT_CLUB_CONTRACT.abi,
      functionName: 'mintMembership',
      args: [params.to, params.tier, params.email, params.tokenURI],
      account
    })

    const txHash = await walletClient.writeContract({
      address: YACHT_CLUB_CONTRACT.address,
      abi: YACHT_CLUB_CONTRACT.abi,
      functionName: 'mintMembership',
      args: [params.to, params.tier, params.email, params.tokenURI]
    })

    logger.info('Server mint transaction sent', { txHash })

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 2
    })

    // Parse Transfer event for tokenId (same logic as client-side)
    const logs = await publicClient.getLogs({
      address: YACHT_CLUB_CONTRACT.address,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: true, name: 'to', type: 'address' },
          { indexed: true, name: 'tokenId', type: 'uint256' }
        ]
      },
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber
    })

    const transferLog = logs.find(log => 
      log.args.to?.toLowerCase() === params.to.toLowerCase() && 
      log.args.from === '0x0000000000000000000000000000000000000000'
    )

    if (!transferLog || !transferLog.args.tokenId) {
      throw new ContractError('Transfer event not found')
    }

    const tokenId = transferLog.args.tokenId

    logger.info('Server mint completed', { 
      tokenId: tokenId.toString(), 
      txHash: receipt.transactionHash 
    })

    return tokenId

  } catch (error: any) {
    logger.error('Server-side mint failed', { error: error.message, params })
    throw new ContractError(
      `Server mint failed: ${error.message}`,
      error.code,
      error.transactionHash
    )
  }
}

/**
 * Utility function to check if address is already a member
 */
export async function checkMemberStatus(address: string): Promise<boolean> {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  })

  try {
    const isMember = await publicClient.readContract({
      address: YACHT_CLUB_CONTRACT.address,
      abi: YACHT_CLUB_CONTRACT.abi,
      functionName: 'isMember',
      args: [address]
    })

    return isMember as boolean
  } catch (error) {
    logger.error('Failed to check member status', { error, address })
    return false
  }
}

/**
 * Check if a wallet already has a membership token
 * Returns the token ID if it exists, null if not
 */
export async function checkTokenExists(walletAddress: string): Promise<bigint | null> {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  })

  try {
    logger.info('Checking if wallet already has membership token', { walletAddress })
    
    const tokenId = await publicClient.readContract({
      address: YACHT_CLUB_CONTRACT.address,
      abi: YACHT_CLUB_CONTRACT.abi,
      functionName: 'getTokenIdByMember',
      args: [walletAddress as `0x${string}`]
    })

    // If tokenId is 0, it means no token exists for this member
    if (tokenId === 0n) {
      logger.info('No existing membership token found for wallet', { walletAddress })
      return null
    }

    logger.info('Found existing membership token', { walletAddress, tokenId: tokenId.toString() })
    return tokenId as bigint

  } catch (error: any) {
    logger.error('Failed to check token existence', { error: error.message, walletAddress })
    
    // If the error indicates the member doesn't exist, return null
    if (error.message.includes('Member not found') || error.message.includes('does not exist')) {
      return null
    }
    
    // For other errors, re-throw to let caller handle
    throw new ContractError(
      `Failed to check token existence: ${error.message}`,
      error.code
    )
  }
}