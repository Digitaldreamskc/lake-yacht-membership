'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return { elementRef, isVisible }
}

// Specialized hooks for different animation types
export function useScrollFadeUp(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options)
  return { elementRef, isVisible, className: `scroll-fade-up ${isVisible ? 'scroll-visible' : ''}` }
}

export function useScrollFadeLeft(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options)
  return { elementRef, isVisible, className: `scroll-fade-left ${isVisible ? 'scroll-visible' : ''}` }
}

export function useScrollFadeRight(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options)
  return { elementRef, isVisible, className: `scroll-fade-right ${isVisible ? 'scroll-visible' : ''}` }
}

export function useScrollScaleIn(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options)
  return { elementRef, isVisible, className: `scroll-scale-in ${isVisible ? 'scroll-visible' : ''}` }
}

// Parallax effect hook
export function useParallax(speed: 'slow' | 'medium' | 'fast' = 'medium') {
  const [offset, setOffset] = useState(0)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      const rect = element.getBoundingClientRect()
      const scrolled = window.pageYOffset
      const rate = scrolled * (speed === 'slow' ? 0.1 : speed === 'medium' ? 0.2 : 0.3)
      
      setOffset(rate)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return { elementRef, offset, className: `parallax-${speed}` }
}

// Staggered animation hook
export function useStaggeredAnimation(
  items: any[],
  delay: number = 100,
  options?: UseScrollAnimationOptions
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, index]))
            }, index * delay)
          })
        }
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '0px 0px -50px 0px',
      }
    )

    observer.observe(container)
    return () => observer.unobserve(container)
  }, [items, delay, options])

  return { containerRef, visibleItems }
}



