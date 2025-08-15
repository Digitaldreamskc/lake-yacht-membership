// app/layout.tsx
'use client'

import React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

    return (
        <html lang="en">
            <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-900">
                {/* Header */}
                <header className="border-b bg-white/60 backdrop-blur">
                    <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Lake Stockton Yacht Club</h1>
                        <nav className="flex items-center space-x-6">
                            <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Home
                            </a>
                            <a href="/real-world" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Real-World Interface
                            </a>
                            <a href="/verify" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Verify Payment
                            </a>
                            <a href="/success" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Success
                            </a>
                        </nav>
                        <span className="text-sm text-gray-600">NFT Membership</span>
                    </div>
                </header>

                {/* Providers WITHOUT Auto Login */}
                {appId ? (
                    <PrivyProvider
                        appId={appId}
                        config={{
                            loginMethods: ['wallet', 'email'],
                            appearance: { theme: 'light' },
                        }}
                    >
                        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
                    </PrivyProvider>
                ) : (
                    <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
                )}

                {/* Footer */}
                <footer className="mt-10 border-t bg-white/60 backdrop-blur">
                    <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-gray-600">
                        © {new Date().getFullYear()} LSYC
                    </div>
                </footer>
            </body>
        </html>
    )
}