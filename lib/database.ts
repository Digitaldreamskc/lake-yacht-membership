// Simple in-memory database for demo - replace with your preferred database
interface PaymentSession {
    sessionId: string
    email: string
    tier: number
    amount: number
    status: 'pending' | 'completed' | 'failed'
    walletAddress?: string
    tokenId?: number
    createdAt: Date
    updatedAt: Date
}

class MemoryDatabase {
    private sessions: Map<string, PaymentSession> = new Map()

    async savePaymentSession(session: PaymentSession): Promise<void> {
        this.sessions.set(session.sessionId, session)
    }

    async getPaymentSession(sessionId: string): Promise<PaymentSession | null> {
        return this.sessions.get(sessionId) || null
    }

    async updatePaymentSession(sessionId: string, updates: Partial<PaymentSession>): Promise<void> {
        const session = this.sessions.get(sessionId)
        if (session) {
            this.sessions.set(sessionId, {
                ...session,
                ...updates,
                updatedAt: new Date()
            })
        }
    }

    async getAllSessions(): Promise<PaymentSession[]> {
        return Array.from(this.sessions.values())
    }
}

export const db = new MemoryDatabase()

// Helper functions
export async function savePaymentSession(
    sessionId: string,
    email: string,
    tier: number,
    amount: number,
    walletAddress?: string
): Promise<void> {
    await db.savePaymentSession({
        sessionId,
        email,
        tier,
        amount,
        walletAddress,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
    })
}

export async function completePaymentSession(
    sessionId: string,
    walletAddress: string,
    tokenId: number
): Promise<void> {
    await db.updatePaymentSession(sessionId, {
        status: 'completed',
        walletAddress,
        tokenId
    })
}