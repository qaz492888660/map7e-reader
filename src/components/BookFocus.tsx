import { useRef, useEffect } from 'react'
import type { Book } from '../data/mockLibrary'

interface Props {
  book: Book
  onEnterReading: () => void
  onReturn: () => void
}

export default function BookFocus({ book, onEnterReading, onReturn }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.style.transform = 'translateZ(120px) scale(1.3) rotateY(-5deg)'
      el.style.boxShadow = '0 30px 70px rgba(0,0,0,0.7), 0 0 50px rgba(212,160,85,0.18)'
    })
  }, [])

  const handleRead = () => {
    const el = bodyRef.current
    if (!el) return
    el.style.transform = 'translateZ(200px) scale(1.6) rotateY(0deg)'
    el.style.boxShadow = '0 0 80px rgba(212,160,85,0.35), 0 0 200px rgba(212,160,85,0.12)'
    setTimeout(onEnterReading, 600)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 1200,
      }}
    >
      {/* Clickable background - returns to wall */}
      <div
        onClick={onReturn}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(3,4,8,0.65)',
          cursor: 'pointer',
        }}
      />

      {/* Spotlight */}
      <div style={{
        position: 'absolute',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(212,160,85,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Book body */}
      <div
        ref={bodyRef}
        onClick={(e) => { e.stopPropagation(); handleRead() }}
        style={{
          width: book.width * 1.4,
          height: book.height * 1.4,
          transformStyle: 'preserve-3d',
          transform: 'translateZ(40px) scale(1.0)',
          transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1), box-shadow 0.7s ease',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Spine face */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '3px 4px 4px 3px',
          background: `linear-gradient(160deg, ${book.spineColor} 0%, ${book.spineDark} 100%)`,
          transform: 'translateZ(8px)',
          overflow: 'hidden',
          boxShadow: '5px 0 16px rgba(0,0,0,0.6), inset -7px 0 16px rgba(0,0,0,0.4), inset 4px 0 8px rgba(255,255,255,0.07)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.85,
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.85,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px 6px', gap: 18,
          }}>
            <span style={{
              writingMode: 'vertical-rl', textOrientation: 'mixed',
              color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 3,
            }}>{book.author}</span>
            <span style={{
              writingMode: 'vertical-rl', textOrientation: 'mixed',
              color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: 700,
              letterSpacing: 5, lineHeight: 1.4,
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}>{book.title}</span>
          </div>
        </div>
        {/* Page edges */}
        <div style={{
          position: 'absolute', top: 0, width: 12, height: '100%',
          right: -7,
          background: 'linear-gradient(90deg, #e8e0c8, #f5eed8 35%, #e8e0c8)',
          borderRadius: '0 2px 2px 0',
          transformOrigin: 'left center',
          transform: 'rotateY(90deg)',
        }} />
      </div>
    </div>
  )
}
