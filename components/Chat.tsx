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
    setMessages([...messages, { text: userMessage, isUser: true }])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your request. Let me help you with that!",
        "That's an interesting question. Here's what I think...",
        "Great idea! I can definitely help you build that.",
        "Let me break this down for you step by step.",
        "I'd be happy to assist you with this project!"
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [...prev, { text: randomResponse, isUser: false }])
      setIsLoading(false)
    }, 1500)
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
