'use client'

import { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <span>×</span>
        </button>

        {/* Tabs */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Вход
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Полное имя</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Введите ваше имя"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="your@email.com"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                className="form-input"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            {activeTab === 'register' && formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <span className="strength-text">
                  {passwordStrength < 50 ? 'Слабый' : passwordStrength < 75 ? 'Средний' : 'Сильный'}
                </span>
              </div>
            )}
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Подтверждение пароля</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Повторите пароль"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}

          {activeTab === 'login' && (
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-text">Запомнить меня</span>
              </label>
              <button type="button" className="forgot-password">
                Забыли пароль?
              </button>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                {activeTab === 'register' ? 'Создание аккаунта...' : 'Вход...'}
              </>
            ) : (
              activeTab === 'register' ? 'Создать аккаунт' : 'Войти'
            )}
          </button>

          <div className="social-divider">
            <span>или</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-button">
              <span className="social-icon">G</span>
              Google
            </button>
            <button type="button" className="social-button">
              <span className="social-icon">⚡</span>
              GitHub
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
