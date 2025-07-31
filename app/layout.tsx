'use client'

import './globals.css'
import { PrivyProvider } from '@privy-io/react-auth'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

    // Show error message if Privy app ID is missing
    if (!privyAppId || privyAppId === 'your_privy_app_id') {
        return (
            <html lang="en">
                <head>
                    <link
                        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                        rel="stylesheet"
                    />
                </head>
                <body className="font-inter">
                    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                            <h1 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h1>
                            <p className="text-gray-700 mb-4">
                                The Privy app ID is missing or invalid. Please:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                                <li>Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
                                <li>Replace <code className="bg-gray-100 px-1 rounded">your_privy_app_id</code> with your actual Privy App ID</li>
                                <li>Restart the development server</li>
                            </ol>
                        </div>
                    </div>
                </body>
            </html>
        )
    }

    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="font-inter">
                <PrivyProvider
                    appId={privyAppId}
                    config={{
                        appearance: {
                            theme: 'light',
                            accentColor: '#676FFF',
                        },
                    }}
                >
                    <div className="min-h-screen bg-white">
                        {children}
                    </div>
                </PrivyProvider>
            </body>
        </html>
    )
}