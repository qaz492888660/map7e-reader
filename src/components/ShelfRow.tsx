import { useRef, useEffect } from 'react'
import BookSpine from './BookSpine'
import type { Book } from '../data/mockLibrary'

interface Props {
  index: number
  label: string
  books: Book[]
  isFocused: boolean
  isDimmed: boolean
  pulledBook: Book | null
  isMobile: boolean
  onFocus: (index: number) => void
  onBookPull: (book: Book) => void
  onBookReturn: () => void
  onBookRead: (book: Book) => void
}

export default function ShelfRow({ index, label, books, isFocused, isDimmed, pulledBook, isMobile, onFocus, onBookPull, onBookReturn, onBookRead }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (isFocused) {
      el.style.transform = 'translateZ(100px) scale(1.08)'
      el.style.filter = 'brightness(1.15)'
      el.style.opacity = '1'
    } else if (isDimmed) {
      el.style.transform = 'translateZ(-50px) scale(0.92)'
      el.style.filter = isMobile ? 'brightness(0.4)' : 'brightness(0.3) blur(2px)'
      el.style.opacity = isMobile ? '0.5' : '0.35'
    } else {
      el.style.transform = 'translateZ(0) scale(1)'
      el.style.filter = 'brightness(0.6)'
      el.style.opacity = '1'
    }
  }, [isFocused, isDimmed, isMobile])

  useEffect(() => {
    const shadow = shadowRef.current
    if (!shadow) return
    shadow.style.opacity = isFocused ? '0.85' : '0.25'
    shadow.style.transform = isFocused ? 'scaleX(1.08)' : 'scaleX(1)'
  }, [isFocused])

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return
    surface.style.boxShadow = isFocused
      ? 'inset 0 2px 3px rgba(255,255,255,0.04), 0 6px 16px rgba(0,0,0,0.65)'
      : 'inset 0 2px 3px rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.5)'
  }, [isFocused])

  useEffect(() => {
    const front = frontRef.current
    if (!front) return
    front.style.boxShadow = isFocused
      ? '0 8px 20px rgba(0,0,0,0.75), inset 0 1px 2px rgba(255,255,255,0.03)'
      : '0 6px 15px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.02)'
  }, [isFocused])

  const pulledIndex = pulledBook ? books.findIndex(b => b.id === pulledBook.id) : -1

  return (
    <div
      ref={rootRef}
      onClick={() => { if (!isFocused && !isDimmed && !pulledBook) onFocus(index) }}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1), filter 0.7s ease, opacity 0.5s ease',
        cursor: isDimmed || pulledBook ? 'default' : 'pointer',
        position: 'relative',
      }}
    >
      {/* Books container */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: isMobile ? 5 : 6,
        padding: isMobile ? '10px 12px' : '12px 16px',
        transformStyle: 'preserve-3d',
        minHeight: isMobile ? 200 : 260,
      }}>
        {books.map((book, i) => {
          const isPulled = pulledBook?.id === book.id
          const isSiblingPulled = pulledBook !== null && !isPulled
          let pullDirection: 'left' | 'right' | null = null
          if (isSiblingPulled && pulledIndex >= 0) {
            pullDirection = i < pulledIndex ? 'left' : 'right'
          }
          return (
            <BookSpine
              key={book.id}
              book={book}
              dimmed={isDimmed}
              pulled={isPulled}
              siblingPulled={isSiblingPulled}
              pullDirection={pullDirection}
              isMobile={isMobile}
              onPull={onBookPull}
              onReturn={onBookReturn}
              onRead={onBookRead}
            />
          )
        })}
      </div>

      {/* Shelf surface */}
      <div
        ref={surfaceRef}
        style={{
          height: isMobile ? 8 : 10,
          background: 'linear-gradient(180deg, #3d2a16 0%, #2a1a0e 40%, #1a1008 100%)',
          borderRadius: '0 0 2px 2px',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.5)',
          position: 'relative',
          transition: 'box-shadow 0.7s ease',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: isFocused
            ? 'linear-gradient(90deg, transparent 4%, rgba(212,160,85,0.2) 30%, rgba(212,160,85,0.35) 50%, rgba(212,160,85,0.2) 70%, transparent 96%)'
            : 'linear-gradient(90deg, transparent 4%, rgba(255,255,255,0.04) 50%, transparent 96%)',
          transition: 'background 0.5s ease',
        }} />
      </div>

      {/* Shelf front panel */}
      <div
        ref={frontRef}
        style={{
          height: isMobile ? 14 : 18,
          background: 'linear-gradient(180deg, #4a3020 0%, #3a2418 30%, #2a1a0e 70%, #1a1008 100%)',
          borderRadius: '0 0 6px 6px',
          boxShadow: '0 6px 15px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.02)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'box-shadow 0.7s ease',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)',
        }} />
      </div>

      {/* Brackets - hidden on mobile for performance */}
      {!isMobile && (
        <>
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
        </>
      )}

      {/* Shadow beneath shelf */}
      <div
        ref={shadowRef}
        style={{
          position: 'absolute', bottom: -14, left: '8%', right: '8%', height: isMobile ? 16 : 24,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)',
          filter: isMobile ? 'blur(4px)' : 'blur(8px)',
          opacity: 0.25,
          transition: 'opacity 0.7s ease, transform 0.7s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Glow behind focused shelf */}
      {isFocused && !isMobile && (
        <div style={{
          position: 'absolute', inset: -20,
          background: 'radial-gradient(ellipse at center, rgba(212,160,85,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: -1,
        }} />
      )}
    </div>
  )
}
