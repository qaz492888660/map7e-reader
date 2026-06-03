import { useRef, useEffect, useState } from 'react'
import type { Book } from '../data/mockLibrary'

interface Props {
  book: Book
  dimmed: boolean
  onPull: (book: Book) => void
}

export default function BookSpine({ book, dimmed, onPull }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (dimmed) {
      el.style.filter = 'brightness(0.35) saturate(0.4)'
      el.style.opacity = '0.5'
    } else {
      el.style.filter = ''
      el.style.opacity = ''
    }
  }, [dimmed])

  const handleEnter = () => {
    if (dimmed) return
    setHover(true)
    const el = ref.current
    if (!el) return
    el.style.transform = `translateZ(22px) scale(1.06) rotateY(-3deg) rotateZ(0deg)`
    el.style.boxShadow = `0 8px 30px rgba(0,0,0,0.7), 0 0 20px rgba(212,160,85,0.15)`
  }

  const handleLeave = () => {
    setHover(false)
    const el = ref.current
    if (!el) return
    el.style.transform = `translateZ(0) scale(1) rotateZ(${book.tilt}deg)`
    el.style.boxShadow = ''
  }

  const handleClick = () => {
    if (dimmed) return
    onPull(book)
  }

  return (
    <div
      className="book-spine-root"
      style={{ width: book.width, height: book.height, flexShrink: 0 }}
    >
      <div
        ref={ref}
        className="book-spine-body"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateZ(${book.tilt}deg)`,
          transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, filter 0.5s ease, opacity 0.5s ease',
          cursor: dimmed ? 'default' : 'pointer',
          position: 'relative',
        }}
      >
        {/* Spine face */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '2px 3px 3px 2px',
            background: `linear-gradient(160deg, ${book.spineColor} 0%, ${book.spineDark} 100%)`,
            transform: 'translateZ(5px)',
            overflow: 'hidden',
            boxShadow: `
              3px 0 10px rgba(0,0,0,0.55),
              inset -5px 0 12px rgba(0,0,0,0.35),
              inset 3px 0 6px rgba(255,255,255,0.06)
            `,
          }}
        >
          {/* Gold top edge */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
            opacity: 0.75,
          }} />
          {/* Gold bottom edge */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
            opacity: 0.75,
          }} />
          {/* Shine */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(115deg, rgba(255,255,255,0.12) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.03) 100%)',
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
          {/* Progress bar */}
          {book.readingProgress > 0 && (
            <div style={{
              position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
              width: 3, height: 36, borderRadius: 2, overflow: 'hidden',
              background: 'rgba(255,255,255,0.08)',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${book.readingProgress * 100}%`,
                background: 'linear-gradient(to top, #f0c966, #d4a055)',
                borderRadius: 2,
                boxShadow: '0 0 5px rgba(212,160,85,0.4)',
              }} />
            </div>
          )}
          {/* Hover glow border */}
          {hover && (
            <div style={{
              position: 'absolute', inset: -2,
              border: '1.5px solid rgba(212,160,85,0.45)',
              borderRadius: 4,
              boxShadow: '0 0 16px rgba(212,160,85,0.25), inset 0 0 10px rgba(212,160,85,0.08)',
              pointerEvents: 'none',
              animation: 'spineGlow 1.5s ease-in-out infinite',
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
    </div>
  )
}
