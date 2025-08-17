'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import Chat from '@/components/Chat'
import Header from '@/components/Header'

export default function Home() {
  const [isChatMode, setIsChatMode] = useState(false)
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean, imageUrl?: string}>>([])

  const handleImageGenerate = async (prompt: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.imageUrl) {
        // Переходим в чат режим и добавляем изображение
        setIsChatMode(true)
        setMessages([
          { text: `Сгенерировано изображение: "${prompt}"`, isUser: true },
          { text: 'Вот ваше изображение!', isUser: false, imageUrl: data.imageUrl }
        ])
      } else if (data.fallback && data.mockImageUrl) {
        // Обрабатываем fallback изображение
        setIsChatMode(true)
        setMessages([
          { text: `Запрос на изображение: "${prompt}"`, isUser: true },
          { text: `⚠️ ${data.error}\n\nПоказываю mock изображение:`, isUser: false, imageUrl: data.mockImageUrl }
        ])
      } else {
        throw new Error(data.error || 'Неизвестная ошибка генерации')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Ошибка при генерации изображения: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'))
    }
  }

  const handleStartChat = async (userMessage: string) => {
    const initialMessages = [{text: userMessage, isUser: true}]
    setMessages(initialMessages)
    setIsChatMode(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: initialMessages
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.response) {
          setMessages(prev => [...prev, { text: data.response, isUser: false }])
        }
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      console.error('Error getting initial AI response:', error)
      setMessages(prev => [...prev, {
        text: "Привет! Я Jarvis, ваш AI-помощник. Как дела? Чем могу помочь в создании чего-то потрясающего?",
        isUser: false
      }])
    }
  }

  const handleNewChat = () => {
    setIsChatMode(false)
    setMessages([])
  }

  return (
    <div className="app-container">
      <Sidebar onNewChat={handleNewChat} onImageGenerate={handleImageGenerate} />
      <div className="main-area">
        <Header />
        {isChatMode ? (
          <Chat messages={messages} setMessages={setMessages} />
        ) : (
          <MainContent onStartChat={handleStartChat} />
        )}
      </div>
    </div>
  )
}
