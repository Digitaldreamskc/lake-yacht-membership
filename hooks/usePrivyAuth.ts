// hooks/usePrivyAuth.ts
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

export function usePrivyAuth() {
  const { user, authenticated, ready, login } = usePrivy()
  const { wallets, connectWallet } = useWallets()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeWallet = wallets?.[0]

  useEffect(() => {
    if (ready) {
      setIsLoading(false)
    }
  }, [ready])

  const checkAuthState = () => {
    if (!ready) {
      throw new Error('Authentication not initialized')
    }
    if (!authenticated || !user) {
      throw new Error('Please log in to continue')
    }
    if (!activeWallet?.address) {
      throw new Error('Please connect a wallet to continue')
    }

    return {
      user,
      wallet: activeWallet,
    }
  }

  return {
    user,
    authenticated,
    ready,
    isLoading,
    error,
    login,
    activeWallet,
    connectWallet,
    checkAuthState,
  }
}