// scripts/contract/deploy.ts

import { ethers } from 'ethers'
import { MEMBERSHIP_ABI } from '../abi/membershipABI'
import { RPC_URL, PRIVATE_KEY } from '../lib/constants'

async function deploy() {
  if (!PRIVATE_KEY || !RPC_URL) {
    throw new Error('Missing environment variables')
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

  console.log('Deploying membership contract...')

  const ContractFactory = new ethers.ContractFactory(
    MEMBERSHIP_ABI,
    BYTECODE, // You'll need to add your contract bytecode
    wallet
  )

  const contract = await ContractFactory.deploy()
  await contract.deployed()

  console.log('Contract deployed to:', contract.address)
  return contract.address
}

if (require.main === module) {
  deploy()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}