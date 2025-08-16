'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import Chat from '@/components/Chat'

export default function Home() {
  const [isChatMode, setIsChatMode] = useState(false)
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([])

  const handleStartChat = (userMessage: string) => {
    setMessages([{text: userMessage, isUser: true}])
    setIsChatMode(true)

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Hello! I'm Jarvis, your AI assistant. How can I help you build something amazing today?",
        isUser: false
      }])
    }, 1000)
  }

  const handleNewChat = () => {
    setIsChatMode(false)
    setMessages([])
  }

  return (
    <div className="app-container">
      <Sidebar onNewChat={handleNewChat} />
      {isChatMode ? (
        <Chat messages={messages} setMessages={setMessages} />
      ) : (
        <MainContent onStartChat={handleStartChat} />
      )}
    </div>
  )
}
