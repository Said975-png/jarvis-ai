'use client'

import { useState } from 'react'
import Header from './Header'

interface MainContentProps {
  onStartChat: (message: string) => void
}

export default function MainContent({ onStartChat }: MainContentProps) {
  const [inputValue, setInputValue] = useState('')

  const actionButtons = [
    { icon: '⧉', text: 'Clone a Screenshot' },
    { icon: '◐', text: 'Import from Figma' },
    { icon: '↑', text: 'Upload a Project' },
    { icon: '⌂', text: 'Landing Page' }
  ]

  return (
    <main className="main-content">
      <Header />
      <div className="content-wrapper">
        <div className="hero-section">
          <h1 className="hero-title">What can I help you build?</h1>
          
          <div className="input-section">
            <div className="input-container">
              <input
                type="text"
                placeholder="Ask Jarvis to..."
                className="main-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button className="input-action-btn">
                <span className="action-icon">✦</span>
                Agent
              </button>
              <button
                className="submit-btn"
                onClick={() => {
                  if (inputValue.trim()) {
                    onStartChat(inputValue.trim())
                  }
                }}
              >
                <span className="submit-icon">→</span>
              </button>
            </div>
            <div className="upgrade-prompt">
              Upgrade to Team to unlock all of J1&apos;s features and more credits
              <button className="upgrade-plan-btn">Upgrade Plan</button>
            </div>
          </div>
          
          <div className="action-buttons">
            {actionButtons.map((button, index) => (
              <button key={index} className="action-btn">
                <span className="btn-icon">{button.icon}</span>
                {button.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
