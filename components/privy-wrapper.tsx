'use client'

import { PrivyProvider } from '@privy-io/react-auth'

interface PrivyWrapperProps {
  children: React.ReactNode
}

export function PrivyWrapper({ children }: PrivyWrapperProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          accentColor: '#1a1a1a',
          showWalletLoginFirst: true,
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
