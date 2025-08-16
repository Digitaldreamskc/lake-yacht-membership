// scripts/check-contract.ts
import { createPublicClient, http, getContract } from 'viem'
import { baseSepolia } from 'viem/chains'
import { YACHT_CLUB_CONTRACT } from '../lib/contracts'

async function checkContract() {
    console.log('🔍 Checking contract state...')
    
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })
    
    const contract = getContract({
        address: YACHT_CLUB_CONTRACT.address,
        abi: YACHT_CLUB_CONTRACT.abi,
    }, publicClient)
    
    try {
        // Check if contract exists
        const code = await publicClient.getBytecode({ address: YACHT_CLUB_CONTRACT.address })
        console.log('📋 Contract bytecode exists:', code ? 'Yes' : 'No')
        
        if (!code) {
            console.log('❌ Contract not deployed or wrong address')
            return
        }
        
        // Check total supply
        try {
            const totalSupply = await contract.read.totalSupply()
            console.log('📊 Total supply:', totalSupply.toString())
        } catch (err) {
            console.log('❌ totalSupply failed:', err)
        }
        
        // Check if we can read the contract
        try {
            const isMember = await contract.read.isMember(['0x0000000000000000000000000000000000000000'])
            console.log('👤 isMember test:', isMember)
        } catch (err) {
            console.log('❌ isMember failed:', err)
        }
        
        // Check contract owner
        try {
            const owner = await contract.read.owner()
            console.log('👑 Contract owner:', owner)
        } catch (err) {
            console.log('❌ owner() failed:', err)
        }
        
    } catch (err) {
        console.error('💥 Error checking contract:', err)
    }
}

checkContract().catch(console.error)

