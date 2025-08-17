import { NextRequest, NextResponse } from 'next/server'

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
