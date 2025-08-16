// scripts/check-contract.ts
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { YACHT_CLUB_CONTRACT } from '../lib/contracts'

async function checkContract() {
    console.log('🔍 Checking contract state...')
    
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })
    
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
            const totalSupply = await publicClient.readContract({
                address: YACHT_CLUB_CONTRACT.address,
                abi: YACHT_CLUB_CONTRACT.abi,
                functionName: 'totalSupply'
            })
            console.log('📊 Total supply:', totalSupply.toString())
        } catch (err) {
            console.log('❌ totalSupply failed:', err)
        }
        
        // Check if we can read the contract
        try {
            const isMember = await publicClient.readContract({
                address: YACHT_CLUB_CONTRACT.address,
                abi: YACHT_CLUB_CONTRACT.abi,
                functionName: 'isMember',
                args: ['0x0000000000000000000000000000000000000000']
            })
            console.log('👤 isMember test:', isMember)
        } catch (err) {
            console.log('❌ isMember failed:', err)
        }
        
        // Check NFC card functionality instead of authorizedMinter
        try {
            const nfcCardInfo = await publicClient.readContract({
                address: YACHT_CLUB_CONTRACT.address,
                abi: YACHT_CLUB_CONTRACT.abi,
                functionName: 'getNFCCardInfo',
                args: ['test-card-123']
            })
            console.log('🔑 NFC Card info test:', nfcCardInfo)
        } catch (err) {
            console.log('❌ getNFCCardInfo failed:', err)
        }
        
    } catch (err) {
        console.error('💥 Error checking contract:', err)
    }
}

checkContract().catch(console.error)

