interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

class AIService {
  private openrouterKeys: string[]
  private groqKey: string
  private currentKeyIndex: number = 0

  constructor() {
    this.openrouterKeys = process.env.OPENROUTER_API_KEYS?.split(',') || []
    this.groqKey = process.env.GROQ_API_KEY || ''
  }

  private getNextOpenRouterKey(): string {
    if (this.openrouterKeys.length === 0) {
      throw new Error('No OpenRouter API keys available')
    }
    
    const key = this.openrouterKeys[this.currentKeyIndex]
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.openrouterKeys.length
    return key
  }

  private async makeOpenRouterRequest(messages: AIMessage[]): Promise<string> {
    const systemPrompt: AIMessage = {
      role: 'system',
      content: `Ты Jarvis - умный AI-ассистент, созданный для помощи пользователям в разработке и создании проектов. 

Ключевые принципы:
- Отвечай ТОЛЬКО на русском языке
- Будь дружелюбным и профессиональным
- Помогай с программированием, дизайном, и техническими вопросами
- Если не знаешь точного ответа, честно скажи об этом
- Предлагай практические решения и примеры кода
- Используй современные технологии и лучшие практики

Помни: ты ��аходишься в интерфейсе похожем на v0.dev, поэтому пользователи ожидают помощи в создании веб-приложений и интерфейсов.`
    }

    const allMessages = [systemPrompt, ...messages]

    for (let attempt = 0; attempt < this.openrouterKeys.length; attempt++) {
      try {
        const apiKey = this.getNextOpenRouterKey()
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://localhost:3000',
            'X-Title': 'V0 Clone AI Assistant'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: allMessages,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          })
        })

        if (!response.ok) {
          console.error(`OpenRouter API error (key ${attempt + 1}):`, response.status, response.statusText)
          continue
        }

        const data = await response.json()
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content
        }
        
        throw new Error('Invalid response format from OpenRouter')
      } catch (error) {
        console.error(`OpenRouter attempt ${attempt + 1} failed:`, error)
        if (attempt === this.openrouterKeys.length - 1) {
          throw error
        }
      }
    }
    
    throw new Error('All OpenRouter keys failed')
  }

  private async makeGroqRequest(messages: AIMessage[]): Promise<string> {
    const systemPrompt: AIMessage = {
      role: 'system',
      content: `Ты Jarvis - умный AI-ассистент, созданный для помощи пользователям в разработке и создании проектов.

Ключевые принципы:
- Отвечай ТОЛЬКО на русском языке
- Будь дружелюбным и профессиональным  
- Помогай с программированием, дизайном, и техническими вопросами
- Если не знаешь точного ответа, честно скажи об этом
- Предлагай практические решения и примеры кода
- Используй современные технологии и ��учшие практики

Помни: ты находишься в интерфейсе похожем на v0.dev, поэтому пользователи ожидают помощи в создании веб-приложений и интерфейсов.`
    }

    const allMessages = [systemPrompt, ...messages]

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: allMessages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content
      }
      
      throw new Error('Invalid response format from Groq')
    } catch (error) {
      console.error('Groq request failed:', error)
      throw error
    }
  }

  async generateResponse(messages: AIMessage[]): Promise<string> {
    // Сначала пробуем Groq (более мощная модель)
    try {
      return await this.makeGroqRequest(messages)
    } catch (groqError) {
      console.log('Groq failed, trying OpenRouter...', groqError)
      
      // Если Groq не работает, используем OpenRouter
      try {
        return await this.makeOpenRouterRequest(messages)
      } catch (openRouterError) {
        console.error('Both providers failed:', { groqError, openRouterError })
        return 'Извините, в данный момент AI-сервис недоступен. Попробуйте позже.'
      }
    }
  }
}

export const aiService = new AIService()
export type { AIMessage }
