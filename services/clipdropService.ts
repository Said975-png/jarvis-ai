interface ClipDropResponse {
  url?: string
  error?: string
}

class ClipDropService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.CLIPDROP_API_KEY || ''
  }

  async generateImage(prompt: string): Promise<ClipDropResponse> {
    if (!this.apiKey) {
      throw new Error('ClipDrop API key not configured')
    }

    console.log('Generating image with prompt:', prompt)

    try {
      const formData = new FormData()
      formData.append('prompt', prompt)

      const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ClipDrop API error:', response.status, errorText)
        throw new Error(`ClipDrop API error: ${response.status}`)
      }

      // ClipDrop возвращает изображение как blob
      const imageBlob = await response.blob()
      
      // Конвертируем blob в base64 для отображения
      const buffer = await imageBlob.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${imageBlob.type};base64,${base64}`

      return { url: dataUrl }
    } catch (error) {
      console.error('Error generating image:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async generateImageVariations(imageFile: File, prompt?: string): Promise<ClipDropResponse> {
    if (!this.apiKey) {
      throw new Error('ClipDrop API key not configured')
    }

    try {
      const formData = new FormData()
      formData.append('image_file', imageFile)
      if (prompt) {
        formData.append('prompt', prompt)
      }

      const response = await fetch('https://clipdrop-api.co/reimagine/v1', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`ClipDrop API error: ${response.status}`)
      }

      const imageBlob = await response.blob()
      const buffer = await imageBlob.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${imageBlob.type};base64,${base64}`

      return { url: dataUrl }
    } catch (error) {
      console.error('Error generating image variations:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const clipdropService = new ClipDropService()
