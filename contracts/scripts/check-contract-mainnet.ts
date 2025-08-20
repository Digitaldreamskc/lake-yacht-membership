// scripts/check-contract-mainnet.ts
import { createPublicClient, http, getContract } from 'viem'
import { base } from 'viem/chains'

async function checkContractMainnet() {
    console.log('🔍 Checking contract on Base mainnet...')
    
    const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138'
    
    const publicClient = createPublicClient({
        chain: base,
        transport: http()
    })
    
    try {
        // Check if contract exists
        const code = await publicClient.getBytecode({ address: contractAddress as `0x${string}` })
        console.log('📋 Contract bytecode exists on mainnet:', code ? 'Yes' : 'No')
        
        if (code) {
            console.log('✅ Contract exists on Base mainnet!')
            console.log('🔗 View on BaseScan:', `https://basescan.org/address/${contractAddress}`)
        } else {
            console.log('❌ Contract not found on Base mainnet either')
        }
        
    } catch (err) {
        console.error('💥 Error checking mainnet contract:', err)
    }
}

checkContractMainnet().catch(console.error)

