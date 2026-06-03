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

远方的天空泛起了鱼肚白，新的一天即将开始。主角深吸一口气，感受着体内澎湃的力量。他知道，这只是一个开始，更大的世界还在前方等待着他。`

export default function ReadingPortal({ book, onClose }: Props) {
  const spineRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const spine = spineRef.current
    const page = pageRef.current
    const bg = bgRef.current
    if (!spine || !page || !bg) return

    bg.style.opacity = '0'
    spine.style.transform = 'rotateY(-90deg)'
    spine.style.opacity = '0'
    page.style.transform = 'rotateY(90deg)'
    page.style.opacity = '0'

    requestAnimationFrame(() => {
      bg.style.transition = 'opacity 0.4s ease'
      bg.style.opacity = '1'
    })

    setTimeout(() => {
      spine.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.4s ease'
      spine.style.transform = 'rotateY(0deg)'
      spine.style.opacity = '1'
    }, 200)

    setTimeout(() => {
      page.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.4s ease'
      page.style.transform = 'rotateY(0deg)'
      page.style.opacity = '1'
    }, 400)

    setTimeout(() => setVisible(true), 1000)
  }, [])

  const handleClose = () => {
    if (!visible) return
    setVisible(false)
    const spine = spineRef.current
    const page = pageRef.current
    const bg = bgRef.current
    if (!spine || !page || !bg) return

    page.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease'
    page.style.transform = 'rotateY(90deg)'
    page.style.opacity = '0'

    setTimeout(() => {
      spine.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease'
      spine.style.transform = 'rotateY(-90deg)'
      spine.style.opacity = '0'
    }, 150)

    setTimeout(() => {
      bg.style.transition = 'opacity 0.4s ease'
      bg.style.opacity = '0'
    }, 400)

    setTimeout(onClose, 800)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      perspective: 1200,
    }}>
      {/* Background - natural vignette, not modal overlay */}
      <div ref={bgRef} style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 50% 45% at 50% 50%, transparent 0%, rgba(2,3,5,0.6) 100%)',
      }} />

      {/* Ambient light from above */}
      <div style={{
        position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 200,
        background: 'radial-gradient(ellipse, rgba(180,140,60,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Dust */}
      <canvas
        ref={(canvas) => {
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          const pts = Array.from({ length: 20 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            s: Math.random() * 1.2 + 0.3,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.08 - 0.04,
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
              ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(212,160,85,${p.o * 0.18})`; ctx.fill()
            }
            raf = requestAnimationFrame(draw)
          }
          draw()
          return () => cancelAnimationFrame(raf)
        }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}
      />

      {/* Book container */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        transformStyle: 'preserve-3d',
        position: 'relative', zIndex: 1,
      }}>
        {/* Spine */}
        <div
          ref={spineRef}
          onClick={handleClose}
          style={{
            width: 50, flexShrink: 0,
            background: `linear-gradient(180deg, ${book.spineColor}, ${book.spineDark})`,
            boxShadow: 'inset -4px 0 10px rgba(0,0,0,0.5), 3px 0 12px rgba(0,0,0,0.4)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            transformOrigin: 'right center',
            cursor: 'pointer',
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
            background: 'linear-gradient(110deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)',
            pointerEvents: 'none',
          }} />
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 700,
            letterSpacing: 4, textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>{book.title}</span>
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.35)', fontSize: 8, letterSpacing: 2,
          }}>{book.author}</span>
        </div>

        {/* Page */}
        <div
          ref={pageRef}
          style={{
            width: 420, height: '70vh', maxHeight: 600,
            background: 'linear-gradient(135deg, #f8f4eb 0%, #f0ead8 50%, #e8e0c8 100%)',
            boxShadow: '5px 0 18px rgba(0,0,0,0.4), -1px 0 4px rgba(0,0,0,0.1)',
            overflow: 'hidden', position: 'relative',
            transformOrigin: 'left center',
          }}
        >
          {/* Paper texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.18,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(0,0,0,0.012) 24px, rgba(0,0,0,0.012) 25px)',
            pointerEvents: 'none',
          }} />
          {/* Gutter shadow */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: 20,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.04), transparent)',
            pointerEvents: 'none',
          }} />
          {/* Text */}
          <div style={{
            padding: '28px 24px',
            height: '100%',
            overflow: 'hidden',
          }}>
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#1a1410',
              marginBottom: 16, letterSpacing: 2,
              textAlign: 'center',
            }}>{book.title}</div>
            <div style={{
              fontSize: 14, color: 'rgba(26,20,16,0.65)', lineHeight: 1.9,
              whiteSpace: 'pre-line',
              fontFamily: '"PingFang SC", "Noto Serif SC", "Microsoft YaHei", serif',
            }}>{SAMPLE}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
