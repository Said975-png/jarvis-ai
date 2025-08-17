'use client'

import { useState } from 'react'

interface SidebarProps {
  onNewChat: () => void
  onImageGenerate?: (prompt: string) => void
}

export default function Sidebar({ onNewChat, onImageGenerate }: SidebarProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const handleGenerateImage = async () => {
    const prompt = window.prompt('Опишите изображение которое хотите создать:')
    if (!prompt) return

    setIsGeneratingImage(true)

    try {
      if (onImageGenerate) {
        await onImageGenerate(prompt)
      } else {
        // Генерируем изображение напрямую если коллбэк не передан
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        })

        const data = await response.json()

        if (data.success && data.imageUrl) {
          // Открываем изображение в новом окне
          const imageWindow = window.open('', '_blank')
          if (imageWindow) {
            imageWindow.document.write(`
              <html>
                <head><title>Сгенерированное изображение</title></head>
                <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                  <img src="${data.imageUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="Сгенерированное изображение"/>
                </body>
              </html>
            `)
            imageWindow.document.close()
          }
        } else {
          alert('Ошибка генерации изображения: ' + (data.error || 'Неизвестная ошибка'))
        }
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Ошибка при генерации изображения')
    } finally {
      setIsGeneratingImage(false)
    }
  }
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">J1</div>
          <span className="plan-badge">Personal</span>
          <span className="free-badge">Free</span>
        </div>
        <div className="user-actions">
          <button className="feedback-btn">Feedback</button>
          <div className="credits">5.00</div>
        </div>
      </div>
      
      <div className="sidebar-content">
        <div className="new-chat-section">
          <button className="new-chat-btn" onClick={onNewChat}>
            <span className="icon">+</span>
            New Chat
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item">
            <span className="nav-icon">⌕</span>
            Search
          </div>
          <div className="nav-item">
            <span className="nav-icon">□</span>
            Projects
          </div>
          <div className="nav-item">
            <span className="nav-icon">⟲</span>
            Recents
          </div>
        </nav>
        
        <div className="sidebar-sections">
          <div className="section">
            <div className="section-header">
              <span>Favorite Chats</span>
              <span className="chevron">›</span>
            </div>
          </div>
          <div className="section">
            <div className="section-header">
              <span>Recents</span>
              <span className="chevron">∨</span>
            </div>
            <div className="section-content">
              <div className="recent-item">
                <span className="recent-icon">◊</span>
                futureiscupanel1
              </div>
            </div>
          </div>

          <div className="generate-image-section">
            <button
              className="generate-image-btn"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
            >
              <span className="generate-icon">{isGeneratingImage ? '⟳' : '◯'}</span>
              {isGeneratingImage ? 'Генерирую...' : 'Generate image'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
