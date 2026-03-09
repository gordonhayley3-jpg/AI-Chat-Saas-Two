export interface ModelInfo {
  id: string
  name: string
  provider: 'openai' | 'google' | 'deepseek' | 'anthropic'
  description: string
  category: 'text' | 'image' | 'code'
  isFree: boolean
  hasReasoning?: boolean
  inputPrice: number   // tokens per 1k chars
  outputPrice: number
  contextLimit: number
  isEnabled: boolean
  isHidden?: boolean
}

export const AI_MODELS: ModelInfo[] = [
  // === FREE MODELS (prioritized) ===
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Бесплатная',
    category: 'text',
    isFree: true,
    inputPrice: 0,
    outputPrice: 0,
    contextLimit: 64000,
    isEnabled: true,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: 'С размышлениями',
    category: 'text',
    isFree: true,
    hasReasoning: true,
    inputPrice: 0,
    outputPrice: 0,
    contextLimit: 64000,
    isEnabled: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    description: 'Бесплатная от Google',
    category: 'text',
    isFree: true,
    inputPrice: 0,
    outputPrice: 0,
    contextLimit: 1000000,
    isEnabled: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Продвинутая',
    category: 'text',
    isFree: false,
    inputPrice: 5,
    outputPrice: 10,
    contextLimit: 2000000,
    isEnabled: true,
  },
  // === PAID MODELS ===
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Быстрая и умная',
    category: 'text',
    isFree: false,
    inputPrice: 5,
    outputPrice: 15,
    contextLimit: 128000,
    isEnabled: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    description: 'Экономичная',
    category: 'text',
    isFree: false,
    inputPrice: 1,
    outputPrice: 2,
    contextLimit: 128000,
    isEnabled: true,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Премиум',
    category: 'text',
    isFree: false,
    inputPrice: 3,
    outputPrice: 15,
    contextLimit: 200000,
    isEnabled: true,
  },
  // === IMAGE MODELS ===
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    description: 'Генерация изображений',
    category: 'image',
    isFree: false,
    inputPrice: 40,
    outputPrice: 40,
    contextLimit: 4096,
    isEnabled: true,
  },
]

export const DEFAULT_MODEL_ID = 'deepseek-v3'
export const FALLBACK_MODEL_ID = 'gemini-2.0-flash'

export const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  google: 'Google',
  deepseek: 'DeepSeek',
  anthropic: 'Anthropic',
}

// Legacy AIModel type alias
export type AIModel = ModelInfo
