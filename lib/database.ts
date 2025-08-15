// lib/database.ts - Mock database for development
interface PaymentSession {
    id: string
    sessionId: string
    walletAddress: string
    email: string
    tier: number
    status: 'pending' | 'completed' | 'failed'
    tokenId?: number
    metadata?: string
    tokenURI?: string
    completedAt?: string
    createdAt: Date
    updatedAt: Date
}

interface MintRecord {
    id: string
    sessionId: string
    paymentIntentId: string
    walletAddress: string
    tier: number
    email: string
    status: 'pending' | 'completed' | 'failed'
    tokenId?: string
    transactionHash?: string
    error?: string
    paymentStatus?: 'succeeded' | 'failed'
    createdAt: Date
    updatedAt: Date
}

// In-memory storage for development (replace with real database in production)
const paymentSessions: Map<string, PaymentSession> = new Map()
const mintRecords: Map<string, MintRecord> = new Map()

export const db = {
    // Payment Session methods
    async getPaymentSession(sessionId: string): Promise<PaymentSession | null> {
        return paymentSessions.get(sessionId) || null
    },

    async createPaymentSession(data: Omit<PaymentSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentSession> {
        const session: PaymentSession = {
            id: `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        paymentSessions.set(data.sessionId, session)
        return session
    },

    async updatePaymentSession(sessionId: string, updates: Partial<PaymentSession>): Promise<PaymentSession | null> {
        const existing = paymentSessions.get(sessionId)
        if (!existing) return null

        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        }
        paymentSessions.set(sessionId, updated)
        return updated
    },

    // Mint Record methods  
    async getMintRecord(sessionId: string): Promise<MintRecord | null> {
        return mintRecords.get(sessionId) || null
    },

    async createMintRecord(data: Omit<MintRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MintRecord> {
        const record: MintRecord = {
            id: `mr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        mintRecords.set(data.sessionId, record)
        return record
    },

    async updateMintRecord(sessionId: string, updates: Partial<MintRecord>): Promise<MintRecord | null> {
        const existing = mintRecords.get(sessionId)
        if (!existing) return null

        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        }
        mintRecords.set(sessionId, updated)
        return updated
    },

    // Transaction method (simplified for mock)
    async transaction<T>(callback: (trx: typeof db) => Promise<T>): Promise<T> {
        return callback(this)
    },

    // Mock Prisma-style methods for compatibility
    mintRecords: {
        findUnique: async ({ where }: { where: { sessionId: string } }) => {
            return mintRecords.get(where.sessionId) || null
        },

        upsert: async ({
            where,
            create,
            update
        }: {
            where: { sessionId: string }
            create: Omit<MintRecord, 'id' | 'createdAt' | 'updatedAt'>
            update: Partial<MintRecord>
        }) => {
            const existing = mintRecords.get(where.sessionId)

            if (existing) {
                const updated = {
                    ...existing,
                    ...update,
                    updatedAt: new Date()
                }
                mintRecords.set(where.sessionId, updated)
                return updated
            } else {
                const record: MintRecord = {
                    id: `mr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    ...create,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                mintRecords.set(where.sessionId, record)
                return record
            }
        },

        update: async ({
            where,
            data
        }: {
            where: { sessionId: string }
            data: Partial<MintRecord>
        }) => {
            const existing = mintRecords.get(where.sessionId)
            if (!existing) throw new Error('Record not found')

            const updated = {
                ...existing,
                ...data,
                updatedAt: new Date()
            }
            mintRecords.set(where.sessionId, updated)
            return updated
        },

        updateMany: async ({
            where,
            data
        }: {
            where: { paymentIntentId: string }
            data: Partial<MintRecord>
        }) => {
            let updated = 0
            for (const [sessionId, record] of mintRecords) {
                if (record.paymentIntentId === where.paymentIntentId) {
                    mintRecords.set(sessionId, {
                        ...record,
                        ...data,
                        updatedAt: new Date()
                    })
                    updated++
                }
            }
            return { count: updated }
        }
    }
}

export default db