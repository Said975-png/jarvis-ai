'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export default function TypewriterText({ text, speed = 50, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else {
      // Hide cursor after completion
      setTimeout(() => {
        setShowCursor(false)
        onComplete?.()
      }, 500)
    }
  }, [currentIndex, text, speed, onComplete])

  // Cursor blinking effect
  useEffect(() => {
    if (currentIndex < text.length) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 530)

      return () => clearInterval(cursorInterval)
    }
  }, [currentIndex, text.length])

  return (
    <span className="typewriter-text">
      {displayedText}
      {showCursor && currentIndex <= text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </span>
  )
}
