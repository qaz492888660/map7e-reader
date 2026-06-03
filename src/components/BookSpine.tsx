import { useRef, useEffect, useState } from 'react'
import type { Book } from '../data/mockLibrary'

interface Props {
  book: Book
  dimmed: boolean
  pulled: boolean
  siblingPulled: boolean
  pullDirection: 'left' | 'right' | null
  onPull: (book: Book) => void
  onReturn: () => void
  onRead: (book: Book) => void
}

export default function BookSpine({ book, dimmed, pulled, siblingPulled, pullDirection, onPull, onReturn, onRead }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (pulled) {
      el.style.transform = 'translateZ(80px) scale(1.15) rotateY(-5deg) rotateZ(0deg)'
      el.style.filter = 'brightness(1.2)'
      el.style.opacity = '1'
      el.style.zIndex = '50'
    } else if (siblingPulled && pullDirection) {
      const shift = pullDirection === 'left' ? -20 : 20
      el.style.transform = `translateX(${shift}px) translateZ(-10px) rotateZ(${book.tilt}deg)`
      el.style.filter = 'brightness(0.4) saturate(0.5)'
      el.style.opacity = '0.5'
      el.style.zIndex = '1'
    } else if (dimmed) {
      el.style.transform = `rotateZ(${book.tilt}deg)`
      el.style.filter = 'brightness(0.3) saturate(0.3)'
      el.style.opacity = '0.4'
      el.style.zIndex = '1'
    } else {
      el.style.transform = `rotateZ(${book.tilt}deg)`
      el.style.filter = ''
      el.style.opacity = ''
      el.style.zIndex = ''
    }
  }, [pulled, siblingPulled, pullDirection, dimmed, book.tilt])

  const handleEnter = () => {
    if (dimmed || pulled || siblingPulled) return
    setHover(true)
  }

  const handleLeave = () => {
    setHover(false)
  }

  const handleClick = () => {
    if (dimmed) return
    if (pulled) {
      onRead(book)
      return
    }
    if (siblingPulled) return
    onPull(book)
  }

  const isHover = hover && !dimmed && !pulled && !siblingPulled

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{
        width: book.width,
        height: book.height,
        flexShrink: 0,
        transformStyle: 'preserve-3d',
        transform: `rotateZ(${book.tilt}deg)${isHover ? ' translateZ(16px) scale(1.05) rotateY(-3deg)' : ''}`,
        transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1), filter 0.5s ease, opacity 0.5s ease, z-index 0s',
        cursor: dimmed || siblingPulled ? 'default' : 'pointer',
        position: 'relative',
      }}
    >
      {/* Spine face */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '2px 3px 3px 2px',
        background: `linear-gradient(160deg, ${book.spineColor} 0%, ${book.spineDark} 100%)`,
        transform: 'translateZ(5px)',
        overflow: 'hidden',
        boxShadow: pulled
          ? '6px 0 20px rgba(0,0,0,0.7), 0 0 30px rgba(212,160,85,0.15), inset -5px 0 12px rgba(0,0,0,0.35), inset 3px 0 6px rgba(255,255,255,0.06)'
          : isHover
          ? '4px 0 14px rgba(0,0,0,0.6), 0 0 20px rgba(212,160,85,0.12), inset -5px 0 12px rgba(0,0,0,0.35), inset 3px 0 6px rgba(255,255,255,0.06)'
          : '3px 0 10px rgba(0,0,0,0.55), inset -5px 0 12px rgba(0,0,0,0.35), inset 3px 0 6px rgba(255,255,255,0.06)',
        transition: 'box-shadow 0.5s ease',
      }}>
        {/* Gold top edge */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
          opacity: pulled ? 0.9 : 0.75,
        }} />
        {/* Gold bottom edge */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
          opacity: pulled ? 0.9 : 0.75,
        }} />
        {/* Shine */}
        <div style={{
          position: 'absolute', inset: 0,
          background: pulled
            ? 'linear-gradient(115deg, rgba(255,255,255,0.18) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.05) 100%)'
            : 'linear-gradient(115deg, rgba(255,255,255,0.12) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.03) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Texture lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.25,
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px)',
          pointerEvents: 'none',
        }} />
        {/* Title + Author */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '18px 3px', gap: 14,
        }}>
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 2,
            maxHeight: 50, overflow: 'hidden',
          }}>{book.author}</span>
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 700,
            letterSpacing: 3, lineHeight: 1.3, maxHeight: 130, overflow: 'hidden',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
          }}>{book.title}</span>
        </div>
        {/* Pulled glow border */}
        {pulled && (
          <div style={{
            position: 'absolute', inset: -2,
            border: '1.5px solid rgba(212,160,85,0.35)',
            borderRadius: 4,
            boxShadow: '0 0 18px rgba(212,160,85,0.2), inset 0 0 10px rgba(212,160,85,0.06)',
            pointerEvents: 'none',
          }} />
        )}
      </div>
      {/* Page edges */}
      <div style={{
        position: 'absolute', top: 0, width: 9, height: '100%',
        right: -5,
        background: 'linear-gradient(90deg, #e8e0c8, #f5eed8 35%, #e8e0c8)',
        borderRadius: '0 2px 2px 0',
        transformOrigin: 'left center',
        transform: 'rotateY(90deg)',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.12)',
      }} />
      {/* Bottom edge */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 7,
        bottom: -4,
        background: 'linear-gradient(90deg, rgba(20,14,8,0.8), rgba(30,20,12,0.65) 50%, rgba(20,14,8,0.8))',
        transformOrigin: 'top center',
        transform: 'rotateX(90deg)',
      }} />
    </div>
  )
}
