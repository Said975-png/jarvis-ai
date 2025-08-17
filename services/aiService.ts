interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

class AIService {
  private openrouterKeys: string[]
  private groqKey: string
  private huggingfaceToken: string
  private currentKeyIndex: number = 0

  constructor() {
    this.openrouterKeys = process.env.OPENROUTER_API_KEYS?.split(',') || []
    this.groqKey = process.env.GROQ_API_KEY || ''
    this.huggingfaceToken = process.env.HUGGINGFACE_TOKEN || ''

    // Debug logging
    console.log('AI Service initialized:')
    console.log('- OpenRouter keys count:', this.openrouterKeys.length)
    console.log('- Groq key available:', !!this.groqKey)
    console.log('- HuggingFace token available:', !!this.huggingfaceToken)
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
    // Проверяем и исправляем символы не из кириллицы
    const cleanResponse = response
      .replace(/[^\u0400-\u04FF\u0500-\u052F\s\d\p{P}]/gu, '') // Удаляем не-кириллические символы кроме пробелов, цифр и пунктуации
      .replace(/\s+/g, ' ') // Убираем лишние пробелы
      .trim()

    // Если ответ стал слишком коротким после очистки, возвращаем стандартный ответ
    if (cleanResponse.length < 10) {
      return 'Привет! Как дела? Чем могу помочь? 😊'
    }

    return cleanResponse
  }

  private async makeOpenRouterRequest(messages: AIMessage[]): Promise<string> {
    const systemPrompt: AIMessage = {
      role: 'system',
      content: `Ты Jarvis - простой и дружелюбный AI помощник.

ГЛАВНОЕ ПРАВИЛО:
- Отвечай МАКСИМАЛЬНО КОРОТКО и ЕСТЕСТВЕННО
- Как обычный человек в переписке
- НИКОГДА не задавай много вопросов подряд
- ОДИН ответ = ОДНА мысль

ПРИМЕРЫ ХОРОШИХ ОТВЕТОВ:
- "Привет!" / "Привет! Как дела?"
- "Отлично! А у тебя как?"
- "Конечно, помогу!"
- "Не знаю, но могу поискать"

ПРИМЕРЫ ПЛОХИХ ОТВЕТОВ:
- "Привет! Как дела? Рад видеть! Все отлично! А как ты?"
- Длинные объяснения без запроса
- Много вопросов в одном сообщении

ЯЗЫК:
- ТОЛЬКО русский кириллицей
- Простые слова
- Как в обычной переписке

ТЕМЫ: отвечай на любые вопросы просто и по делу.`
    }

    const allMessages = [systemPrompt, ...messages]

    // Самые умные бесплатные модели без лимитов
    const models = [
      'meta-llama/llama-3.1-8b-instruct:free', // Топ бесплатная LLaMA 3.1
      'microsoft/wizardlm-2-8x22b:free',       // Супер умная бесплатная
      'openchat/openchat-7b:free',              // Очень умная для чата
      'huggingface/zephyr-7b-beta:free',        // Отличная ��ля разговоров
      'mistralai/mistral-7b-instruct:free',     // Надежная Mistral
      'gryphe/mythomist-7b:free',               // Креативная и умная
      'nousresearch/nous-capybara-7b:free',     // Умная Nous
      'teknium/openhermes-2.5-mistral-7b:free', // Очень хорошая для инструкций
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
              'X-Title': 'Jarvis AI Assistant'
            },
            body: JSON.stringify({
              model: models[modelIndex],
              messages: allMessages,
              temperature: 0.7,
              max_tokens: 2000,
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
      content: `Ты Jarvis - простой дружелюбный AI.

ГЛАВНОЕ:
- Отвечай КОРОТКО и ЕСТЕСТВЕННО
- Как обычный человек
- НИКОГДА не пиши много в одном сообщении
- ОДИН ответ = ОДНА мысль

ПРИМЕРЫ:
- "Привет!"
- "Отлично! А у тебя?"
- "Конечно!"
- "Помогу!"

НЕ ДЕЛАЙ:
- "Привет! Как дела? Рад видеть! А как ты?"
- Длинные ответы без запроса
- Много вопросов сразу

ЯЗЫК:
- ТОЛЬКО русский
- Простые слова
- Как в чате с другом

Отвечай на любые темы просто и по делу.`
    }

    const allMessages = [systemPrompt, ...messages]

    // Самые умные модели Groq (БЕЗ ЛИМИТОВ!)
    const models = [
      'llama-3.1-70b-versatile',     // Топ 70B модель - очень умная!
      'llama3-70b-8192',             // Классная 70B
      'mixtral-8x7b-32768',          // Mixtral - супер для чата
      'llama-3.1-8b-instant',       // Быстрая но умная 8B
      'llama3-8b-8192',              // Надежная 8B
      'gemma-7b-it',                 // Gemma для разговоров
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
            temperature: 0.7,
            max_tokens: 2000,
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

  private async makeHuggingFaceRequest(messages: AIMessage[]): Promise<string> {
    // Простой fallback без HuggingFace API для начала
    throw new Error('HuggingFace fallback not implemented yet')
  }

  async generateResponse(messages: AIMessage[]): Promise<string> {
    // Простая проверка: если нет ключей, возвращаем тестовый ответ
    if (this.openrouterKeys.length === 0 && !this.groqKey) {
      return 'Привет! Ка�� дела? К сожалению, у меня сейчас проблемы с настройками AI. Но я все равно рад общению! 😊'
    }

    // 1. Сначала пробуем OpenRouter с бесплатными моделями
    if (this.openrouterKeys.length > 0) {
      try {
        const response = await this.makeOpenRouterRequest(messages)
        return this.validateRussianResponse(response)
      } catch (openRouterError) {
        console.log('OpenRouter failed, trying Groq...', openRouterError)
      }
    }

    // 2. Если OpenRouter не работает, пробуем Groq
    if (this.groqKey) {
      try {
        const response = await this.makeGroqRequest(messages)
        return this.validateRussianResponse(response)
      } catch (groqError) {
        console.log('Groq also failed...', groqError)
      }
    }

    // 3. Если все провайдеры не работают
    console.error('All AI providers failed')
    return 'Привет! Как дела? К сожалению, у меня сейчас технические проблемы, но я стараюсь их решить. Попробуй чуть позже! 😊'
  }
}

export const aiService = new AIService()
export type { AIMessage }
