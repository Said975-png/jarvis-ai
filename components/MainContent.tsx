'use client'

import { useState } from 'react'

export default function MainContent() {
  const [inputValue, setInputValue] = useState('')

  const actionButtons = [
    { icon: '📷', text: 'Clone a Screenshot' },
    { icon: '🎨', text: 'Import from Figma' },
    { icon: '📤', text: 'Upload a Project' },
    { icon: '🏠', text: 'Landing Page' }
  ]

  return (
    <main className="main-content">
      <div className="content-wrapper">
        <div className="hero-section">
          <h1 className="hero-title">What can I help you build?</h1>
          
          <div className="input-section">
            <div className="input-container">
              <input 
                type="text" 
                placeholder="Ask v0 to build..." 
                className="main-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button className="input-action-btn">
                <span className="action-icon">⚡</span>
                Agent
              </button>
              <button className="submit-btn">
                <span className="submit-icon">→</span>
              </button>
            </div>
            <div className="upgrade-prompt">
              Upgrade to Team to unlock all of v0&apos;s features and more credits
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
        
        <div className="community-section">
          <div className="community-header">
            <h2>From the Community</h2>
            <button className="browse-all-btn">Browse All ›</button>
          </div>
          <p className="community-subtitle">Explore what the community is building with v0.</p>
          <div className="community-content">
            <div className="community-placeholder"></div>
          </div>
        </div>
      </div>
    </main>
  )
}
