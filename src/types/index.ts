export interface User {
  id: string
  email: string
  displayName?: string
  role?: string
}

export interface Chat {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  chatId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  tokensUsed: number
  createdAt: string
}

export interface TokenBalance {
  id: string
  userId: string
  tokens: number
  updatedAt: string
}

export interface TokenTransaction {
  id: string
  userId: string
  amount: number
  type: 'purchase' | 'usage' | 'bonus'
  description?: string
  stripeSessionId?: string
  createdAt: string
}

export interface TokenPackage {
  id: string
  name: string
  tokens: number
  price: number
  priceId: string
  popular?: boolean
  description: string
}
