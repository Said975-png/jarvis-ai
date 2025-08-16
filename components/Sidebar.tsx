'use client'

export default function Sidebar() {
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
          <button className="new-chat-btn">
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
            <button className="generate-image-btn">
              <span className="generate-icon">🎨</span>
              Generate image
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
