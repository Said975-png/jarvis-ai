import { NextRequest, NextResponse } from 'next/server'
import { aiService, AIMessage } from '@/services/aiService'

export async function GET() {
  try {
    const testMessages: AIMessage[] = [
      { role: 'user', content: 'Привет! Как дела?' }
    ]

    const response = await aiService.generateResponse(testMessages)
    
    return NextResponse.json({ 
      success: true,
      response,
      message: 'AI service is working correctly'
    })
  } catch (error) {
    console.error('AI test failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'AI service test failed'
      },
      { status: 500 }
    )
  }
}
