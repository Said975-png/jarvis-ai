import { NextRequest, NextResponse } from 'next/server'
import { aiService, AIMessage } from '@/services/aiService'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Конвертируем сообщения в нужный формат
    const aiMessages: AIMessage[] = messages.map((msg: any) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }))

    // Получаем ответ от AI
    const response = await aiService.generateResponse(aiMessages)
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
