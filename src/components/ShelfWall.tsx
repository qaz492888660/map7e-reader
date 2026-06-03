import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShelfRow from './ShelfRow'
import FocusReader from './FocusReader'
import { library, type Book } from '../data/mockLibrary'
import { useShelfPhysics } from '../hooks/useShelfPhysics'
import { useBookOpen } from '../hooks/useBookOpen'

export default function ShelfWall() {
  const {
    shelfStates,
    onShelfHover,
    onShelfLeave,
    onShelfClick,
  } = useShelfPhysics(library.length)

  const { focusedBook, isOpen, openBook, closeBook } = useBookOpen()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#030408' }}>
      {/* ── Background layers ── */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% 18%, #0c1018 0%, #060810 40%, #030408 100%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 65% 55% at 50% 40%, transparent 25%, rgba(2,3,5,0.75) 70%, rgba(0,0,0,0.95) 100%)',
      }} />

      {/* ── Ambient top light ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(180,140,60,0.06) 0%, transparent 70%)',
      }} />

      {/* ── Floating dust particles ── */}
      <DustParticles />

      {/* ── Header ── */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-10 py-5" style={{
        background: 'linear-gradient(180deg, rgba(3,4,8,0.85) 0%, rgba(3,4,8,0.4) 65%, transparent 100%)',
      }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg" style={{
            background: 'radial-gradient(circle at 35% 35%, #f0c966, #d4a055 50%, #8b6914)',
            boxShadow: '0 0 14px rgba(212,160,85,0.3)',
          }} />
          <span className="text-gold text-lg font-extrabold tracking-[4px] font-display"
            style={{ textShadow: '0 0 18px rgba(212,160,85,0.25)' }}>
            MAP7E
          </span>
        </div>
        <button
          className="relative px-5 py-2 rounded-full border border-gold/25 text-gold text-sm font-semibold tracking-[2px] font-display overflow-hidden transition-all duration-300 hover:border-gold/60 hover:shadow-[0_0_20px_rgba(212,160,85,0.18)]"
          onClick={() => {}}
        >
          <span className="absolute inset-0 bg-gradient-to-br from-gold/8 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <span className="relative">AI 找书</span>
        </button>
      </header>

      {/* ── Shelf wall ── */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden scrollbar-hide"
        style={{ perspective: isMobile ? undefined : 1200, perspectiveOrigin: '50% 38%' }}
      >
        <div
          className={`flex flex-col ${isMobile ? 'gap-10 py-28 px-4' : 'gap-14 py-24 px-8'} max-w-[1100px] w-full`}
          style={isMobile ? {} : { transformStyle: 'preserve-3d', transform: 'rotateX(4deg)' }}
        >
          {library.map((shelf, i) => (
            <motion.div
              key={shelf.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <ShelfRow
                index={i}
                label={shelf.label}
                books={shelf.books}
                state={shelfStates[i]}
                onHover={onShelfHover}
                onLeave={onShelfLeave}
                onClick={onShelfClick}
                onBookSelect={openBook}
                isMobile={isMobile}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Focus reader overlay ── */}
      <AnimatePresence>
        {focusedBook && (
          <FocusReader
            book={focusedBook}
            isOpen={isOpen}
            onClose={closeBook}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Dust particle canvas ── */
function DustParticles() {
  const canvasRef = import.meta.hot ? null : null

  return (
    <canvas
      ref={(canvas) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        interface Particle {
          x: number; y: number; size: number
          vx: number; vy: number
          opacity: number; life: number; maxLife: number
        }

        const particles: Particle[] = Array.from({ length: 45 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25 - 0.15,
          opacity: 0, life: 0, maxLife: Math.random() * 220 + 100,
        }))

        let raf: number
        const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          for (const p of particles) {
            p.life++
            if (p.life > p.maxLife) {
              p.x = Math.random() * canvas.width
              p.y = Math.random() * canvas.height
              p.life = 0
              p.maxLife = Math.random() * 220 + 100
            }
            const r = p.life / p.maxLife
            p.opacity = r < 0.1 ? r * 10 : r > 0.8 ? (1 - r) * 5 : 1
            p.x += p.vx
            p.y += p.vy

            const a = p.opacity * 0.35
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(212,160,85,${a})`
            ctx.fill()

            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
            g.addColorStop(0, `rgba(212,160,85,${a * 0.4})`)
            g.addColorStop(1, 'rgba(212,160,85,0)')
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
            ctx.fillStyle = g
            ctx.fill()
          }
          raf = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
      }}
      className="absolute inset-0 pointer-events-none opacity-50"
    />
  )
}
