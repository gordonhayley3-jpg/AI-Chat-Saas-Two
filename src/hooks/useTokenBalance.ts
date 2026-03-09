import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import type { TokenBalance } from '../types'

export function useTokenBalance(userId: string | undefined) {
  const [balance, setBalance] = useState<TokenBalance | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const results = await blink.db.table('token_balances').list({
        where: { user_id: userId },
        limit: 1,
      }) as any[]
      
      if (results.length > 0) {
        const b = results[0]
        setBalance({ id: b.id, userId: b.user_id, tokens: Number(b.tokens), updatedAt: b.updated_at })
      } else {
        // Create default balance with 1000 bonus tokens
        const now = new Date().toISOString()
        const newBalance = await blink.db.table('token_balances').create({
          user_id: userId,
          tokens: 1000,
          updated_at: now,
        }) as any
        // Record bonus transaction
        await blink.db.table('token_transactions').create({
          user_id: userId,
          amount: 1000,
          type: 'bonus',
          description: 'Welcome bonus tokens',
          created_at: now,
        })
        setBalance({ id: newBalance.id, userId, tokens: 1000, updatedAt: now })
      }
    } catch (err) {
      console.error('Error fetching token balance:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const deductTokens = useCallback(async (amount: number) => {
    if (!userId || !balance) return false
    if (balance.tokens < amount) return false
    const now = new Date().toISOString()
    try {
      await blink.db.table('token_balances').update(balance.id, {
        tokens: balance.tokens - amount,
        updated_at: now,
      })
      await blink.db.table('token_transactions').create({
        user_id: userId,
        amount: -amount,
        type: 'usage',
        description: 'Chat message',
        created_at: now,
      })
      setBalance(prev => prev ? { ...prev, tokens: prev.tokens - amount } : null)
      return true
    } catch (err) {
      console.error('Error deducting tokens:', err)
      return false
    }
  }, [userId, balance])

  return { balance, loading, fetchBalance, deductTokens }
}
