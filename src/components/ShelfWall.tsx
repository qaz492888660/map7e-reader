import { useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dy) > 50) {
      if (dy < 0 && mobileShelf < library.length - 1) setMobileShelf(s => s + 1)
      if (dy > 0 && mobileShelf > 0) setMobileShelf(s => s - 1)
    }
  }

  const handleBookRead = () => {
    enterReading()
  }

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
        width: 600, height: 250,
        background: 'radial-gradient(ellipse, rgba(180,140,60,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Dust */}
      <DustCanvas />

      {/* Wall */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 1800,
        perspectiveOrigin: '50% 38%',
      }}>
        {isMobile ? (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ transformStyle: 'preserve-3d', width: '92%' }}>
              <ShelfRow
                index={mobileShelf}
                label={library[mobileShelf].label}
                books={library[mobileShelf].books}
                isFocused={focusedShelf === mobileShelf}
                isDimmed={false}
                pulledBook={phase === 'bookPulled' ? pulledBook : null}
                onFocus={focusShelf}
                onBookPull={pullBook}
                onBookReturn={returnToShelf}
                onBookRead={handleBookRead}
              />
            </div>
            {/* Mobile indicators */}
            <div style={{
              position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 7,
            }}>
              {library.map((_, i) => (
                <div key={i} style={{
                  width: i === mobileShelf ? 18 : 5, height: 5, borderRadius: 3,
                  background: i === mobileShelf ? 'rgba(212,160,85,0.5)' : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
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

function DustCanvas() {
  return (
    <canvas
      ref={(canvas) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)
        const pts = Array.from({ length: 35 }, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          s: Math.random() * 1.5 + 0.3,
          vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2 - 0.1,
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
            const a = p.o * 0.28
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(212,160,85,${a})`; ctx.fill()
          }
          raf = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}
    />
  )
}
