import { useState, useEffect, useRef } from 'react'
import { blink } from '../blink/client'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.isLoading && !initializedRef.current) {
        // SDK still loading — keep our loading=true
        return
      }
      initializedRef.current = true
      setUser(state.user as User | null)
      setLoading(false)
    })
    // Safety timeout — never stay loading forever
    const timeout = setTimeout(() => {
      if (!initializedRef.current) {
        initializedRef.current = true
        setLoading(false)
      }
    }, 4000)
    return () => { unsubscribe(); clearTimeout(timeout) }
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
