import { blink } from './client'

// Typed table accessors using the table() method pattern
export const db = {
  chats: () => blink.db.table('chats'),
  messages: () => blink.db.table('messages'),
  tokenBalances: () => blink.db.table('token_balances'),
  tokenTransactions: () => blink.db.table('token_transactions'),
}
