import React, { useRef, useState, useEffect } from 'react'

const delayClasses = ['delay-0', 'delay-75', 'delay-150', 'delay-200', 'delay-300']

export default function ScrollReveal({ children, index = 0, className = '' }) {
  const targetRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = targetRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        setVisible(true)
        observer.unobserve(el)
      }
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1,
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  const delayClass = delayClasses[index % delayClasses.length]

  return (
    <div
      ref={targetRef}
      className={`reveal ${delayClass} ${visible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
