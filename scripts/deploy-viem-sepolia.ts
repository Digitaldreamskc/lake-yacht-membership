import { createWalletClient, createPublicClient, http, parseEther, getContract, type Address } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Contract ABI (just the constructor and basic functions we need for deployment)
const CONTRACT_ABI = [
  {
    inputs: [
      { name: 'authorizedMinter', type: 'address' },
      { name: 'royaltyRecipient', type: 'address' },
      { name: 'royaltyFraction', type: 'uint96' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  }
] as const

// Contract bytecode (you'll need to compile the contract first)
const CONTRACT_BYTECODE = '0x...' // This will be filled in after compilation

async function main() {
  console.log('🚀 Deploying YachtClubMembership contract to Base Sepolia testnet...')
  
  // Check environment variables
  if (!process.env.CONTRACT_PRIVATE_KEY) {
    throw new Error('CONTRACT_PRIVATE_KEY environment variable is required')
  }
  
  if (!process.env.AUTHORIZED_MINTER_ADDRESS) {
    throw new Error('AUTHORIZED_MINTER_ADDRESS environment variable is required')
  }
  
  if (!process.env.ROYALTY_RECIPIENT_ADDRESS) {
    throw new Error('ROYALTY_RECIPIENT_ADDRESS environment variable is required')
  }

  // Create account from private key
  const account = privateKeyToAccount(process.env.CONTRACT_PRIVATE_KEY as `0x${string}`)
  console.log('📝 Deploying contract with account:', account.address)
  
  // Create clients
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account
  })

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  })

  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log('💰 Account balance:', balance.toString(), 'wei')

  // Contract parameters
  const authorizedMinter = process.env.AUTHORIZED_MINTER_ADDRESS as Address
  const royaltyRecipient = process.env.ROYALTY_RECIPIENT_ADDRESS as Address
  const royaltyFraction = 1000n // 10% in basis points

  console.log('🔧 Contract parameters:')
  console.log('   - Authorized Minter:', authorizedMinter)
  console.log('   - Royalty Recipient:', royaltyRecipient)
  console.log('   - Royalty Fraction:', Number(royaltyFraction) / 100, '%')

  // For now, we'll need to compile the contract first to get the bytecode
  console.log('⚠️  Contract compilation required before deployment')
  console.log('   Please compile the contract first to get the bytecode')
  
  // TODO: After compilation, uncomment and use this:
  /*
  const hash = await walletClient.deployContract({
    abi: CONTRACT_ABI,
    bytecode: CONTRACT_BYTECODE,
    args: [authorizedMinter, royaltyRecipient, royaltyFraction],
  })

  console.log('⏳ Waiting for contract deployment...')
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  
  const contractAddress = receipt.contractAddress
  if (!contractAddress) {
    throw new Error('Contract deployment failed - no contract address in receipt')
  }

  console.log('✅ YachtClubMembership deployed to:', contractAddress)
  console.log('🔗 Contract on Base Sepolia:', `https://sepolia.basescan.org/address/${contractAddress}`)
  console.log('📊 Transaction hash:', hash)

  // Save deployment info
  const deploymentInfo = {
    network: 'Base Sepolia Testnet',
    chainId: baseSepolia.id,
    contractAddress: contractAddress,
    deployer: account.address,
    authorizedMinter: authorizedMinter,
    royaltyRecipient: royaltyRecipient,
    royaltyFraction: royaltyFraction.toString(),
    deployedAt: new Date().toISOString(),
    transactionHash: hash,
    constructorArgs: [authorizedMinter, royaltyRecipient, royaltyFraction.toString()],
  }

  console.log('\n📋 Deployment Summary:')
  console.log(JSON.stringify(deploymentInfo, null, 2))

  console.log('\n🎯 Next steps:')
  console.log('1. Set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file')
  console.log('2. Verify contract on Base Sepolia (optional but recommended)')
  console.log('3. Test the contract functionality')
  console.log('4. Update your application configuration')
  */

  return { status: 'compilation_required' }
}

// Handle errors and exit
main()
  .then((result) => {
    console.log('✅ Script completed:', result)
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
