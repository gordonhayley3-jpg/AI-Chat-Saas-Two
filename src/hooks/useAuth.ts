import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user as User | null)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    return blink.auth.signInWithEmail(email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    return blink.auth.signUp({ email, password, displayName } as any)
  }

  const signOut = async () => {
    return blink.auth.signOut()
  }

  const sendPasswordReset = async (email: string) => {
    return blink.auth.sendPasswordResetEmail(email)
  }

  return { user, loading, signIn, signUp, signOut, sendPasswordReset }
}
