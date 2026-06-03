import { useEffect, useRef, useState, useCallback } from 'react'
import ShelfRow from './ShelfRow'
import ReadingPortal from './ReadingPortal'
import { library } from '../data/mockLibrary'
import { useSpatialState } from '../hooks/useSpatialState'

export default function ShelfWall() {
  const {
    phase, focusedShelf, pulledBook,
    focusShelf, returnToWall, pullBook, returnToShelf, enterReading, closeReading,
  } = useSpatialState()

  const [isMobile, setIsMobile] = useState(false)
  const [mobileShelf, setMobileShelf] = useState(0)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const absDy = Math.abs(dy)
    const absDx = Math.abs(dx)

    if (absDy > absDx && absDy > 50) {
      if (dy < 0 && mobileShelf < library.length - 1) setMobileShelf(s => s + 1)
      if (dy > 0 && mobileShelf > 0) setMobileShelf(s => s - 1)
    }
  }, [mobileShelf])

  const handleBookRead = useCallback(() => {
    enterReading()
  }, [enterReading])

  const dustCount = isMobile ? 15 : 35

  return (
    <div
      style={{
        width: '100vw', height: '100vh', overflow: 'hidden',
        background: '#030408', position: 'relative',
      }}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 80% at 50% 18%, #0c1018 0%, #060810 40%, #030408 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 55% at 50% 40%, transparent 25%, rgba(2,3,5,0.65) 70%, rgba(0,0,0,0.9) 100%)',
      }} />
      {/* Ambient top glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: isMobile ? 400 : 600, height: isMobile ? 180 : 250,
        background: 'radial-gradient(ellipse, rgba(180,140,60,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Dust */}
      <DustCanvas count={dustCount} />

      {/* Wall */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: isMobile ? 1200 : 1800,
        perspectiveOrigin: '50% 38%',
      }}>
        {isMobile ? (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Shelf label */}
            <div style={{
              position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(212,160,85,0.4)', fontSize: 10, letterSpacing: 3,
              fontWeight: 600,
            }}>
              {library[mobileShelf].label}
            </div>

            {/* Books */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 8,
              padding: '20px 24px',
              transformStyle: 'preserve-3d',
            }}>
              {library[mobileShelf].books.map((book, i) => {
                const isPulled = pulledBook?.id === book.id
                const isSiblingPulled = pulledBook !== null && !isPulled
                let pullDirection: 'left' | 'right' | null = null
                if (isSiblingPulled && pulledBook) {
                  const pulledIdx = library[mobileShelf].books.findIndex(b => b.id === pulledBook.id)
                  pullDirection = i < pulledIdx ? 'left' : 'right'
                }
                return (
                  <BookSpineMobile
                    key={book.id}
                    book={book}
                    pulled={isPulled}
                    siblingPulled={isSiblingPulled}
                    pullDirection={pullDirection}
                    onPull={pullBook}
                    onReturn={returnToShelf}
                    onRead={handleBookRead}
                  />
                )
              })}
            </div>

            {/* Shelf surface */}
            <div style={{
              width: '100%', height: 8,
              background: 'linear-gradient(180deg, #3d2a16 0%, #2a1a0e 40%, #1a1008 100%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }} />
            <div style={{
              width: '100%', height: 14,
              background: 'linear-gradient(180deg, #4a3020 0%, #3a2418 30%, #2a1a0e 70%, #1a1008 100%)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
            }} />
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 36,
            width: '90%', maxWidth: 1100,
            transformStyle: 'preserve-3d',
            transform: 'rotateX(3deg)',
            padding: '30px 0 50px',
          }}>
            {library.map((shelf, i) => (
              <ShelfRow
                key={shelf.id}
                index={i}
                label={shelf.label}
                books={shelf.books}
                isFocused={focusedShelf === i}
                isDimmed={focusedShelf !== null && focusedShelf !== i}
                pulledBook={phase === 'bookPulled' && focusedShelf === i ? pulledBook : null}
                isMobile={false}
                onFocus={focusShelf}
                onBookPull={pullBook}
                onBookReturn={returnToShelf}
                onBookRead={handleBookRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reading */}
      {phase === 'reading' && pulledBook && (
        <ReadingPortal book={pulledBook} onClose={closeReading} />
      )}
    </div>
  )
}

function BookSpineMobile({ book, pulled, siblingPulled, pullDirection, onPull, onReturn, onRead }: {
  book: import('../data/mockLibrary').Book
  pulled: boolean
  siblingPulled: boolean
  pullDirection: 'left' | 'right' | null
  onPull: (book: import('../data/mockLibrary').Book) => void
  onReturn: () => void
  onRead: (book: import('../data/mockLibrary').Book) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (pulled) {
      el.style.transform = 'translateZ(60px) scale(1.12) rotateY(-4deg) rotateZ(0deg)'
      el.style.filter = 'brightness(1.15)'
      el.style.opacity = '1'
    } else if (siblingPulled && pullDirection) {
      const shift = pullDirection === 'left' ? -15 : 15
      el.style.transform = `translateX(${shift}px) rotateZ(${book.tilt}deg)`
      el.style.filter = 'brightness(0.5)'
      el.style.opacity = '0.6'
    } else {
      el.style.transform = `rotateZ(${book.tilt}deg)`
      el.style.filter = ''
      el.style.opacity = ''
    }
  }, [pulled, siblingPulled, pullDirection, book.tilt])

  const handleClick = () => {
    if (pulled) { onRead(book); return }
    if (siblingPulled) return
    onPull(book)
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        width: book.width * 0.85,
        height: book.height * 0.85,
        flexShrink: 0,
        transformStyle: 'preserve-3d',
        transform: `rotateZ(${book.tilt}deg)`,
        transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), filter 0.4s ease, opacity 0.4s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${book.spineColor} 0%, ${book.spineDark} 100%)`,
        transform: 'translateZ(4px)',
        overflow: 'hidden',
        boxShadow: '2px 0 8px rgba(0,0,0,0.5), inset -4px 0 10px rgba(0,0,0,0.3), inset 2px 0 5px rgba(255,255,255,0.05)',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
          opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
          opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '14px 2px', gap: 10,
        }}>
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.45)', fontSize: 8, letterSpacing: 1.5,
            maxHeight: 40, overflow: 'hidden',
          }}>{book.author}</span>
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 700,
            letterSpacing: 2, lineHeight: 1.3, maxHeight: 100, overflow: 'hidden',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>{book.title}</span>
        </div>
        {pulled && (
          <div style={{
            position: 'absolute', inset: -1,
            border: '1px solid rgba(212,160,85,0.3)',
            boxShadow: '0 0 12px rgba(212,160,85,0.15)',
            pointerEvents: 'none',
          }} />
        )}
      </div>
      <div style={{
        position: 'absolute', top: 0, width: 7, height: '100%',
        right: -4,
        background: 'linear-gradient(90deg, #e8e0c8, #f5eed8 35%, #e8e0c8)',
        transformOrigin: 'left center',
        transform: 'rotateY(90deg)',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 5,
        bottom: -3,
        background: 'linear-gradient(90deg, rgba(20,14,8,0.7), rgba(30,20,12,0.5) 50%, rgba(20,14,8,0.7))',
        transformOrigin: 'top center',
        transform: 'rotateX(90deg)',
      }} />
    </div>
  )
}

function DustCanvas({ count }: { count: number }) {
  return (
    <canvas
      ref={(canvas) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)
        const pts = Array.from({ length: count }, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          s: Math.random() * 1.3 + 0.3,
          vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15 - 0.08,
          o: 0, l: 0, ml: Math.random() * 200 + 100,
        }))
        let raf: number
        const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          for (const p of pts) {
            p.l++
            if (p.l > p.ml) { p.l = 0; p.x = Math.random() * canvas.width; p.y = Math.random() * canvas.height }
            const r = p.l / p.ml
            p.o = r < 0.1 ? r * 10 : r > 0.8 ? (1 - r) * 5 : 1
            p.x += p.vx; p.y += p.vy
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(212,160,85,${p.o * 0.25})`; ctx.fill()
          }
          raf = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35 }}
    />
  )
}
