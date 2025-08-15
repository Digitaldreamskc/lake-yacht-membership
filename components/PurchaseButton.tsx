"use client"

import { useState } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"

type Props = {
    tier: "Standard" | "Family" | "Premium" | "Elite" | "Lifetime"
    className?: string
}

export function PurchaseButton({ tier, className }: Props) {
    const { authenticated, login, user, ready, linkWallet } = usePrivy()
    const { wallets } = useWallets()
    const [loading, setLoading] = useState(false)

    const onClick = async () => {
        try {
            if (!authenticated) {
                await login()
                return
            }

            // Wait for Privy to be ready
            if (!ready) {
                console.log("Waiting for Privy to be ready...")
                return
            }

            const userEmail = user?.email?.address
            // Get the first connected wallet's address
            const activeWallet = wallets?.[0]
            const walletAddress = activeWallet?.address

            console.log("Auth state:", {
                authenticated,
                userEmail,
                walletAddress,
                walletsCount: wallets?.length
            })

            if (!userEmail || !walletAddress) {
                alert("We couldn't read your email or wallet from Privy. Please ensure you're logged in correctly.")
                return
            }

            setLoading(true)

            const res = await fetch("/api/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tierType: tier,
                    userEmail,
                    walletAddress,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data?.error || "Checkout failed")
            }

            if (data?.url) {
                window.location.href = data.url
            } else {
                throw new Error("Missing redirect URL from server")
            }
        } catch (err: any) {
            console.error("Checkout error:", err)
            alert(err?.message || "Something went wrong starting checkout.")
        } finally {
            setLoading(false)
        }
    }

    const handleConnectWallet = async () => {
        if (!authenticated) {
            await login()
        } else {
            // User is authenticated but no wallet connected, use linkWallet
            await linkWallet()
        }
    }

    // Show loading state while Privy is initializing
    if (!ready) {
        return (
            <button
                disabled
                className={
                    className ??
                    "inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition disabled:opacity-50"
                }
            >
                Loading...
            </button>
        )
    }

    // If not authenticated, show "Connect Wallet"
    if (!authenticated) {
        return (
            <button
                onClick={handleConnectWallet}
                className={
                    className ??
                    "inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition"
                }
            >
                Connect Wallet
            </button>
        )
    }

    // If authenticated but no wallet is connected, show "Link Wallet"
    if (!wallets?.length) {
        return (
            <button
                onClick={handleConnectWallet}
                className={
                    className ??
                    "inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition"
                }
            >
                Link Wallet
            </button>
        )
    }

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={
                className ??
                "inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition disabled:opacity-50"
            }
        >
            {loading ? "Redirecting…" : "Purchase Membership"}
        </button>
    )
}