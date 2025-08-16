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

Помни: ты находишься в интерфейсе похожем на v0.dev, поэтому пользователи ожидают помощи в создании веб-приложений и интерфейсов.`
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
      content: `Ты Jarvis - умный AI-ассистент, созданный для помощи пользователям в разработке и создании проектов.

Ключевые принципы:
- Отвечай ТОЛЬКО на русском языке
- Будь дружелюбным и профессиональным
- Помогай с программированием, дизайном, и техническими вопросами
- Если не знаешь точного ответа, честно скажи об этом
- Предлагай практические решения и примеры кода
- Используй современные технологии и лучшие практики

Помни: ты находишься в интерфейсе похожем на v0.dev, поэтому пользователи о��идают помощи в создании веб-приложений и интерфейсов.`
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

  private validateRussianResponse(response: string): string {
    // Проверяем и исправляем символы не из кириллицы
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
