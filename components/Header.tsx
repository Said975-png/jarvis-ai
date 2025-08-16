'use client'

import { useState } from 'react'
import AuthModal from './AuthModal'

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login')

  const openModal = (tab: 'login' | 'register') => {
    setModalTab(tab)
    setIsModalOpen(true)
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="auth-buttons">
            <button className="login-btn" onClick={() => openModal('login')}>
              Войти
            </button>
            <button className="register-btn" onClick={() => openModal('register')}>
              Регистрация
            </button>
          </div>
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
