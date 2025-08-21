'use client'

import { PrivyProvider } from '@privy-io/react-auth'

interface PrivyWrapperProps {
  children: React.ReactNode
}

export function PrivyWrapper({ children }: PrivyWrapperProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!
  
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        loginMethods: ['email'],
        requireUserWallet: true, // 🔥 required to ensure wallet is attached
      }}
    >
      {children}
    </PrivyProvider>
  )
}
