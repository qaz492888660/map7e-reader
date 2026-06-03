import { useRef, useEffect } from 'react'
import BookSpine from './BookSpine'
import type { Book } from '../data/mockLibrary'

interface Props {
  index: number
  label: string
  books: Book[]
  isFocused: boolean
  isDimmed: boolean
  onFocus: (index: number) => void
  onBookPull: (book: Book) => void
  isMobile: boolean
}

export default function ShelfRow({ index, label, books, isFocused, isDimmed, onFocus, onBookPull, isMobile }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (isFocused) {
      el.style.transform = 'translateZ(80px) scale(1.06)'
      el.style.filter = 'brightness(1.1)'
    } else if (isDimmed) {
      el.style.transform = 'translateZ(-30px) scale(0.94)'
      el.style.filter = 'brightness(0.4) blur(2px)'
      el.style.opacity = '0.5'
    } else {
      el.style.transform = 'translateZ(0) scale(1)'
      el.style.filter = 'brightness(0.7)'
      el.style.opacity = '1'
    }
  }, [isFocused, isDimmed])

  return (
    <div
      ref={rootRef}
      className="shelf-row-root"
      onClick={() => { if (!isFocused && !isDimmed) onFocus(index) }}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1), filter 0.7s ease, opacity 0.5s ease',
        cursor: isDimmed ? 'default' : 'pointer',
        position: 'relative',
      }}
    >
      {/* Shelf label */}
      <div style={{
        marginBottom: 6, marginLeft: 4,
        opacity: isFocused ? 0.9 : 0.35,
        transition: 'opacity 0.5s ease',
      }}>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 3,
          color: '#d4a055', textTransform: 'uppercase',
          fontFamily: '"SF Pro Display", "PingFang SC", system-ui, sans-serif',
        }}>{label}</span>
      </div>

      {/* Books container */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 6,
        padding: '12px 16px',
        transformStyle: 'preserve-3d',
        minHeight: 260,
      }}>
        {books.map((book) => (
          <BookSpine
            key={book.id}
            book={book}
            dimmed={isDimmed}
            onPull={onBookPull}
          />
        ))}
      </div>

      {/* Shelf surface */}
      <div style={{
        height: 10,
        background: 'linear-gradient(180deg, #3d2a16 0%, #2a1a0e 40%, #1a1008 100%)',
        borderRadius: '0 0 2px 2px',
        boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.03), 0 5px 14px rgba(0,0,0,0.55)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: isFocused
            ? 'linear-gradient(90deg, transparent 4%, rgba(212,160,85,0.22) 30%, rgba(212,160,85,0.35) 50%, rgba(212,160,85,0.22) 70%, transparent 96%)'
            : 'linear-gradient(90deg, transparent 4%, rgba(255,255,255,0.04) 50%, transparent 96%)',
          transition: 'background 0.5s ease',
        }} />
      </div>

      {/* Shelf front panel */}
      <div style={{
        height: 18,
        background: 'linear-gradient(180deg, #4a3020 0%, #3a2418 30%, #2a1a0e 70%, #1a1008 100%)',
        borderRadius: '0 0 6px 6px',
        boxShadow: '0 7px 18px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.02)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.18,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)',
        }} />
      </div>

      {/* Brackets */}
      <div style={{
        position: 'absolute', bottom: -6, left: 40,
        width: 10, height: 26,
        background: 'linear-gradient(180deg, #3a2418, #2a1a0e)',
        borderRadius: '0 0 3px 3px',
        boxShadow: '0 4px 7px rgba(0,0,0,0.5)',
      }} />
      <div style={{
        position: 'absolute', bottom: -6, right: 40,
        width: 10, height: 26,
        background: 'linear-gradient(180deg, #3a2418, #2a1a0e)',
        borderRadius: '0 0 3px 3px',
        boxShadow: '0 4px 7px rgba(0,0,0,0.5)',
      }} />

      {/* Shadow beneath shelf */}
      <div style={{
        position: 'absolute', bottom: -12, left: '8%', right: '8%', height: 20,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)',
        filter: 'blur(6px)',
        opacity: isFocused ? 0.9 : 0.4,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
