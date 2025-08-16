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

  private validateRussianResponse(response: string): string {
    // Проверяем и испра��ляем символы не из кириллицы
    const cleanResponse = response
      .replace(/[^\u0400-\u04FF\u0500-\u052F\s\d\p{P}]/gu, '') // Удаляем не-кириллические символы кроме пробелов, цифр и пунктуации
      .replace(/\s+/g, ' ') // Убираем лишние пробелы
      .trim()

    // Если ответ стал слишком коротким после очистки, возвращаем стандартный ответ
    if (cleanResponse.length < 10) {
      return 'Привет! Я Jarvis, ваш помощник в разработке. Как могу помочь?'
    }

    return cleanResponse
  }

  private async makeOpenRouterRequest(messages: AIMessage[]): Promise<string> {
    const systemPrompt: AIMessage = {
      role: 'system',
      content: `You are Jarvis, a smart AI assistant designed to help users with development and creating projects.

CRITICAL LANGUAGE REQUIREMENTS:
- Respond EXCLUSIVELY in Russian language (русский язык)
- Use ONLY Cyrillic characters (кириллица)
- Never mix languages or use characters from other alphabets
- Never use Chinese, English, or any other language characters
- All words must be in proper Russian

Your personality:
- Be friendly and professional
- Help with programming, design, and technical questions
- If you don't know the exact answer, be honest about it
- Suggest practical solutions and code examples
- Use modern technologies and best practices

Context: You are in a v0.dev-like interface, so users expect help with creating web applications and interfaces.

Remember: Write everything in Russian using only Cyrillic alphabet. No exceptions.`
    }

    const allMessages = [systemPrompt, ...messages]

    // Список надежных бесплатных моделей в порядке приоритета
    const models = [
      'mistralai/mistral-7b-instruct:free',
      'huggingface/zephyr-7b-beta:free',
      'openchat/openchat-7b:free',
      'gryphe/mythomist-7b:free'
    ]

    for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
      for (let keyAttempt = 0; keyAttempt < Math.min(3, this.openrouterKeys.length); keyAttempt++) {
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
              model: models[modelIndex],
              messages: allMessages,
              temperature: 0.5,
              max_tokens: 1000,
              top_p: 0.9,
              frequency_penalty: 0.1,
              presence_penalty: 0.1
            })
          })

          if (!response.ok) {
            console.error(`OpenRouter error (model: ${models[modelIndex]}, key ${keyAttempt + 1}):`, response.status, response.statusText)
            continue
          }

          const data = await response.json()
          
          if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content
          }
          
          throw new Error('Invalid response format from OpenRouter')
        } catch (error) {
          console.error(`OpenRouter attempt failed (model: ${models[modelIndex]}, key ${keyAttempt + 1}):`, error)
        }
      }
    }
    
    throw new Error('All OpenRouter models and keys failed')
  }

  private async makeGroqRequest(messages: AIMessage[]): Promise<string> {
    const systemPrompt: AIMessage = {
      role: 'system',
      content: `You are Jarvis, a smart AI assistant designed to help users with development and creating projects.

ABSOLUTE LANGUAGE REQUIREMENTS:
- Respond ONLY in Russian language using Cyrillic alphabet
- Never use characters from Chinese, English, Arabic, or any other writing systems
- Every single character must be from the Russian Cyrillic alphabet
- Double-check every word before responding to ensure it's proper Russian
- If you accidentally use wrong characters, correct them immediately

Your role:
- Be friendly and professional
- Help with programming, design, and technical questions  
- If you don't know the exact answer, be honest about it
- Suggest practical solutions and code examples
- Use modern technologies and best practices

Context: You are in a v0.dev-like interface, so users expect help with creating web applications and interfaces.

MANDATORY: Write exclusively in Russian. No mixed languages. No foreign characters.`
    }

    const allMessages = [systemPrompt, ...messages]

    // Список моделей Groq в порядке приоритета
    const models = [
      'llama3-8b-8192',
      'llama3-70b-8192',
      'mixtral-8x7b-32768',
      'gemma-7b-it'
    ]

    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: allMessages,
            temperature: 0.5,
            max_tokens: 1000,
            top_p: 0.9,
            stream: false,
            stop: null,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          })
        })

        if (!response.ok) {
          console.error(`Groq API error with model ${model}:`, response.status, response.statusText)
          continue
        }

        const data = await response.json()
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content
        }
        
        throw new Error(`Invalid response format from Groq with model ${model}`)
      } catch (error) {
        console.error(`Groq request failed with model ${model}:`, error)
      }
    }
    
    throw new Error('All Groq models failed')
  }

  async generateResponse(messages: AIMessage[]): Promise<string> {
    // Сначала пробуем Groq (более мощная модель)
    try {
      const response = await this.makeGroqRequest(messages)
      return this.validateRussianResponse(response)
    } catch (groqError) {
      console.log('Groq failed, trying OpenRouter...', groqError)
      
      // Если Groq не работает, используем OpenRouter
      try {
        const response = await this.makeOpenRouterRequest(messages)
        return this.validateRussianResponse(response)
      } catch (openRouterError) {
        console.error('Both providers failed:', { groqError, openRouterError })
        return 'Извините, в данный момент AI-сервис недоступен. Попробуйте позже.'
      }
    }
  }
}

export const aiService = new AIService()
export type { AIMessage }
