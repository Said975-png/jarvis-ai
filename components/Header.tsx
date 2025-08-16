'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const openModal = (tab: 'login' | 'register') => {
    setModalTab(tab)
    setIsModalOpen(true)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <header className="header">
        <div className="header-content">
          {isAuthenticated && user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatar}
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-name">{user.fullName}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <div className="user-actions">
                    <button className="user-action-btn">Настройки</button>
                    <button className="user-action-btn" onClick={logout}>
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={() => openModal('login')}>
                Войти
              </button>
              <button className="register-btn" onClick={() => openModal('register')}>
                Регистрация
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  )
}
