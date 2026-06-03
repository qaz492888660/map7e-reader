import { useRef, useEffect, useState } from 'react'
import type { Book } from '../data/mockLibrary'

interface Props {
  book: Book
  onClose: () => void
}

const SAMPLE = `苍穹之上的世界在眼前展开。主角站在城门之前，望着远处连绵的山脉，心中既有期待也有不安。这是他第一次离开家乡，踏上这条充满未知的道路。

风从山谷中吹来，带着泥土和青草的气息。他知道，从这一刻起，一切都将不同。城门的守卫用审视的目光打量着他，手中的长枪在阳光下泛着冷光。

修炼的日子枯燥而漫长。每天天不亮就开始打坐吐纳，直到月上中天才停下。体内的真气如同溪流，缓慢而坚定地流淌着。

三个月后，终于迎来了突破。体内真气翻涌如海，天地间的灵气疯狂涌入身体。那一刻，他感受到了前所未有的力量。

战斗来得比想象的要早。当敌人如潮水般涌来时，主角拔出了腰间的长剑。剑身在阳光下泛着寒光，映照出他坚毅的面容。

胜利的消息传遍了四方。站在山巅之上，俯瞰着脚下的大地。风吹过衣袍，猎猎作响。新的传说，从此刻开始书写。

远方的天空泛起了鱼肚白，新的一天即将开始。主角深吸一口气，感受着体内澎湃的力量。他知道，这只是一个开始，更大的世界还在前方等待着他。

山谷中的风带着丝丝凉意，吹动着他的衣角。远处的城门在晨光中显得格外庄严，仿佛在诉说着千年的故事。主角微微一笑，迈步向前走去。`

export default function ReadingPortal({ book, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const spineRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'entering' | 'visible' | 'leaving'>('entering')

  useEffect(() => {
    const spine = spineRef.current
    const page = pageRef.current
    const bg = bgRef.current
    if (!spine || !page || !bg) return

    // Initial state
    bg.style.opacity = '0'
    spine.style.transform = 'rotateY(-90deg) scale(0.8)'
    spine.style.opacity = '0'
    page.style.transform = 'rotateY(90deg) scale(0.8)'
    page.style.opacity = '0'

    // Phase 1: Background fades in (0-400ms)
    requestAnimationFrame(() => {
      bg.style.transition = 'opacity 0.4s ease'
      bg.style.opacity = '1'
    })

    // Phase 2: Spine opens (200-800ms)
    setTimeout(() => {
      spine.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.4s ease'
      spine.style.transform = 'rotateY(0deg) scale(1)'
      spine.style.opacity = '1'
    }, 200)

    // Phase 3: Page opens (400-1000ms)
    setTimeout(() => {
      page.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.4s ease'
      page.style.transform = 'rotateY(0deg) scale(1)'
      page.style.opacity = '1'
    }, 400)

    // Phase 4: Complete
    setTimeout(() => {
      setPhase('visible')
    }, 1200)
  }, [])

  const handleClose = () => {
    if (phase !== 'visible') return
    setPhase('leaving')

    const spine = spineRef.current
    const page = pageRef.current
    const bg = bgRef.current
    if (!spine || !page || !bg) return

    // Close animation
    page.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease'
    page.style.transform = 'rotateY(90deg) scale(0.8)'
    page.style.opacity = '0'

    setTimeout(() => {
      spine.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease'
      spine.style.transform = 'rotateY(-90deg) scale(0.8)'
      spine.style.opacity = '0'
    }, 150)

    setTimeout(() => {
      bg.style.transition = 'opacity 0.4s ease'
      bg.style.opacity = '0'
    }, 400)

    setTimeout(() => {
      onClose()
    }, 800)
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 1200,
      }}
    >
      {/* Background */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(8,10,18,0.97) 0%, rgba(4,5,10,0.99) 100%)',
        }}
      />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Ambient light - warm glow from above */}
      <div style={{
        position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(180,140,60,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Side ambient lights */}
      <div style={{
        position: 'absolute', top: '30%', left: '10%',
        width: 200, height: 400,
        background: 'radial-gradient(ellipse, rgba(180,140,60,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '10%',
        width: 200, height: 400,
        background: 'radial-gradient(ellipse, rgba(180,140,60,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Dust particles */}
      <canvas
        ref={(canvas) => {
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          const pts = Array.from({ length: 30 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            s: Math.random() * 1.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.1 - 0.05,
            o: 0, l: 0, ml: Math.random() * 250 + 150,
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
              const a = p.o * 0.2
              ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(212,160,85,${a})`; ctx.fill()
            }
            raf = requestAnimationFrame(draw)
          }
          draw()
          return () => cancelAnimationFrame(raf)
        }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}
      />

      {/* Book container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'stretch',
          transformStyle: 'preserve-3d',
          maxHeight: '82vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Spine */}
        <div
          ref={spineRef}
          style={{
            width: 55, flexShrink: 0,
            background: `linear-gradient(180deg, ${book.spineColor}, ${book.spineDark})`,
            borderRadius: '5px 0 0 5px',
            boxShadow: 'inset -5px 0 12px rgba(0,0,0,0.5), 3px 0 14px rgba(0,0,0,0.45)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            transformOrigin: 'right center',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.8,
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.8,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)',
            pointerEvents: 'none',
          }} />
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.88)', fontSize: 15, fontWeight: 700,
            letterSpacing: 4, textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>{book.title}</span>
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 2,
          }}>{book.author}</span>
        </div>

        {/* Page */}
        <div
          ref={pageRef}
          style={{
            width: 'min(480px, 80vw)',
            background: 'linear-gradient(135deg, #f8f4eb 0%, #f0ead8 50%, #e8e0c8 100%)',
            borderRadius: '0 5px 5px 0',
            boxShadow: '5px 0 20px rgba(0,0,0,0.4), -1px 0 5px rgba(0,0,0,0.12)',
            overflow: 'hidden', position: 'relative',
            transformOrigin: 'left center',
          }}
        >
          {/* Paper texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.2,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 26px, rgba(0,0,0,0.015) 26px, rgba(0,0,0,0.015) 27px)',
            pointerEvents: 'none',
          }} />
          {/* Gutter shadow */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: 30,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent)',
            pointerEvents: 'none',
          }} />
          {/* Text content */}
          <div style={{
            padding: '36px 32px', overflowY: 'auto', maxHeight: '82vh',
            position: 'relative',
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 700, color: '#1a1410',
              marginBottom: 20, letterSpacing: 2,
            }}>{book.title}</h2>
            <p style={{
              fontSize: 15, color: 'rgba(26,20,16,0.72)', lineHeight: 2.1,
              whiteSpace: 'pre-line',
              fontFamily: '"PingFang SC", "Noto Serif SC", "Source Han Serif SC", "Microsoft YaHei", serif',
            }}>{SAMPLE}</p>
            <div style={{
              marginTop: 40, textAlign: 'center',
              color: 'rgba(26,20,16,0.2)', fontSize: 12, letterSpacing: 4,
            }}>· · ·</div>
          </div>
        </div>
      </div>

      {/* Close area - click outside book */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute', inset: 0,
          cursor: 'pointer',
          zIndex: 0,
        }}
      />
    </div>
  )
}
