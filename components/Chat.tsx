'use client'

import { useState } from 'react'
import TypewriterText from './TypewriterText'

interface Message {
  text: string
  isUser: boolean
}

interface ChatProps {
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

export default function Chat({ messages, setMessages }: ChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    const newMessages = [...messages, { text: userMessage, isUser: true }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.response) {
        setMessages(prev => [...prev, { text: data.response, isUser: false }])
      } else {
        throw new Error('No response from AI service')
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, {
        text: 'Извините, произошла ошибка при получении ответа. Попробуйте еще раз.',
        isUser: false
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
            <div className="message-content">
              <div className="message-text">
                {message.isUser ? (
                  message.text
                ) : (
                  <TypewriterText
                    text={message.text}
                    speed={30}
                  />
                )}
              </div>
              {message.imageUrl && (
                <div className="message-image">
                  <img
                    src={message.imageUrl}
                    alt="Сгенерированное изображение"
                    style={{
                      maxWidth: '400px',
                      maxHeight: '400px',
                      borderRadius: '8px',
                      marginTop: '10px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // Открываем изображение в полном размере
                      const imageWindow = window.open('', '_blank')
                      if (imageWindow) {
                        imageWindow.document.write(`
                          <html>
                            <head><title>Изображение</title></head>
                            <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                              <img src="${message.imageUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="Изображение"/>
                            </body>
                          </html>
                        `)
                        imageWindow.document.close()
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-container">
          <input
            type="text"
            placeholder="Message Jarvis..."
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="chat-submit-btn" disabled={isLoading}>
            <span className="submit-icon">→</span>
          </button>
        </div>
      </form>
    </main>
  )
}
