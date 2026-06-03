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

胜利的消息传遍了四方。站在山巅之上，俯瞰着脚下的大地。风吹过衣袍，猎猎作响。新的传说，从此刻开始书写。`

export default function ReadingPortal({ book, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true)
    })
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 800)
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: visible ? 'rgba(4,5,10,0.96)' : 'rgba(4,5,10,0)',
        transition: 'background 0.8s ease',
        overflow: 'hidden',
      }}
    >
      {/* Ambient light */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(180,140,60,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating dust */}
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
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.15 - 0.1,
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
              const a = p.o * 0.3
              ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(212,160,85,${a})`; ctx.fill()
              const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 3)
              g.addColorStop(0, `rgba(212,160,85,${a * 0.3})`); g.addColorStop(1, 'rgba(212,160,85,0)')
              ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 3, 0, Math.PI * 2)
              ctx.fillStyle = g; ctx.fill()
            }
            raf = requestAnimationFrame(draw)
          }
          draw()
          return () => cancelAnimationFrame(raf)
        }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}
      />

      {/* Book + Page */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        transformStyle: 'preserve-3d',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.9)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.8s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease',
        maxHeight: '80vh',
      }}>
        {/* Spine */}
        <div style={{
          width: 60, flexShrink: 0,
          background: `linear-gradient(180deg, ${book.spineColor}, ${book.spineDark})`,
          borderRadius: '6px 0 0 6px',
          boxShadow: 'inset -6px 0 14px rgba(0,0,0,0.5), 4px 0 16px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.8,
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.8,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)',
            pointerEvents: 'none',
          }} />
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 700,
            letterSpacing: 5, textShadow: '0 2px 5px rgba(0,0,0,0.5)',
          }}>{book.title}</span>
          <span style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: 2,
          }}>{book.author}</span>
        </div>

        {/* Page */}
        <div
          ref={contentRef}
          style={{
            width: 'min(480px, 80vw)',
            background: 'linear-gradient(135deg, #f8f4eb 0%, #f0ead8 50%, #e8e0c8 100%)',
            borderRadius: '0 6px 6px 0',
            boxShadow: '6px 0 24px rgba(0,0,0,0.45), -1px 0 6px rgba(0,0,0,0.15)',
            overflow: 'hidden', position: 'relative',
          }}
        >
          {/* Page texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.25,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.025) 27px, rgba(0,0,0,0.025) 28px)',
            pointerEvents: 'none',
          }} />
          {/* Gutter shadow */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: 30,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent)',
            pointerEvents: 'none',
          }} />
          {/* Text */}
          <div style={{
            padding: '36px 32px', overflowY: 'auto', maxHeight: '80vh',
            position: 'relative',
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 700, color: '#1a1410',
              marginBottom: 20, letterSpacing: 2,
              fontFamily: '"SF Pro Display", "PingFang SC", system-ui, sans-serif',
            }}>{book.title}</h2>
            <p style={{
              fontSize: 14, color: 'rgba(26,20,16,0.7)', lineHeight: 2,
              whiteSpace: 'pre-line',
              fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
            }}>{SAMPLE}</p>
            <div style={{
              marginTop: 30, textAlign: 'center',
              color: 'rgba(26,20,16,0.25)', fontSize: 12,
            }}>— 试读结束 —</div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute', top: 24, right: 24,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.5)', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease 0.5s',
        }}
      >×</button>
    </div>
  )
}
