'use client'

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="auth-buttons">
          <button className="login-btn">
            Войти
          </button>
          <button className="register-btn">
            Регистрация
          </button>
        </div>
      </div>
    </header>
  )
}
