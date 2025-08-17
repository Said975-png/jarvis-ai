import { NextRequest, NextResponse } from 'next/server'

// Функция для создания mock изображения когда ClipDrop недоступен
function generateMockImage(prompt: string): string {
  // Создаем простое SVG изображение с текстом prompt
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)"/>
      <rect x="20" y="20" width="472" height="472" rx="20" fill="white" fill-opacity="0.1"/>
      <text x="256" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold"
            text-anchor="middle" fill="white">🎨 Mock Image</text>
      <text x="256" y="250" font-family="Arial, sans-serif" font-size="16"
            text-anchor="middle" fill="white" opacity="0.8">ClipDrop недоступен</text>
      <text x="256" y="300" font-family="Arial, sans-serif" font-size="14"
            text-anchor="middle" fill="white" opacity="0.6">Запрос: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}</text>
      <text x="256" y="350" font-family="Arial, sans-serif" font-size="12"
            text-anchor="middle" fill="white" opacity="0.4">Проверьте баланс ClipDrop</text>
    </svg>
  `

  // Конвертируем SVG в base64
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    const apiKey = process.env.CLIPDROP_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ClipDrop API key not configured' },
        { status: 500 }
      )
    }

    console.log('Generating image with prompt:', prompt)
    console.log('API key available:', !!apiKey)
    console.log('API key length:', apiKey.length)

    // Генерируем изображение напрямую в API route
    const formData = new FormData()
    formData.append('prompt', prompt)

    const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    })

    if (!response.ok) {
      let userFriendlyMessage = `ClipDrop API error: ${response.status}`

      // Специальные сообщения для конкретных ошибок
      switch (response.status) {
        case 402:
          userFriendlyMessage = 'На аккаунте ClipDrop закончились кредиты. Проверьте баланс аккаунта.'
          break
        case 401:
          userFriendlyMessage = 'Неверный API ключ ClipDrop. Проверьте настройки.'
          break
        case 429:
          userFriendlyMessage = 'Превышен лимит запросов. Попробуйте позже.'
          break
        case 400:
          userFriendlyMessage = 'Неверный запрос к ClipDrop API. Проверьте текст описания.'
          break
        default:
          userFriendlyMessage = `ClipDrop API недоступен (${response.status} - ${response.statusText})`
      }

      console.error('ClipDrop API error:', response.status, response.statusText)

      // Если проблема с кредитами, предлагаем fallback
      if (response.status === 402) {
        return NextResponse.json(
          {
            error: userFriendlyMessage,
            fallback: true,
            mockImageUrl: generateMockImage(prompt)
          },
          { status: 200 } // Возвращаем 200 чтобы клиент мог обработать fallback
        )
      }

      return NextResponse.json(
        { error: userFriendlyMessage },
        { status: 500 }
      )
    }

    // Получаем изображение как blob
    const imageBlob = await response.blob()

    // Конвертируем в base64 для передачи клиенту
    const buffer = await imageBlob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${imageBlob.type || 'image/png'};base64,${base64}`

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl
    })
  } catch (error) {
    console.error('Image generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
