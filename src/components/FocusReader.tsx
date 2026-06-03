import { motion } from 'framer-motion'
import type { Book } from '../data/mockLibrary'

interface FocusReaderProps {
  book: Book
  isOpen: boolean
  onClose: () => void
}

const sampleText = `${"\n".repeat(2)}
第一章 初临

苍穹之上的世界在眼前展开。主角站在城门之前，望着远处连绵的山脉，心中既有期待也有不安。这是他第一次离开家乡，踏上这条充满未知的道路。

风从山谷中吹来，带着泥土和青草的气息。他知道，从这一刻起，一切都将不同。城门的守卫用审视的目光打量着他，手中的长枪在阳光下泛着冷光。

第二章 契机

修炼的日子枯燥而漫长。每天天不亮就开始打坐吐纳，直到月上中天才停下。体内的真气如同溪流，缓慢而坚定地流淌着。

三个月后，终于迎来了突破。体内真气翻涌如海，天地间的灵气疯狂涌入身体。那一刻，他感受到了前所未有的力量。

第三章 磨砺

战斗来得比想象的要早。当敌人如潮水般涌来时，主角拔出了腰间的长剑。剑身在阳光下泛着寒光，映照出他坚毅的面容。

胜利的消息传遍了四方。站在山巅之上，俯瞰着脚下的大地。风吹过衣袍，猎猎作响。新的传说，从此刻开始书写。`

export default function FocusReader({ book, isOpen, onClose }: FocusReaderProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 cursor-pointer"
        style={{
          background: 'rgba(3,4,8,0.88)',
          backdropFilter: 'blur(12px)',
        }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Book expansion animation */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ scale: 0.15, y: 80, rotateY: -30, opacity: 0 }}
        animate={isOpen ? {
          scale: 1,
          y: 0,
          rotateY: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 180, damping: 22, delay: 0.05 },
        } : {
          scale: 0.3,
          y: 40,
          rotateY: -15,
          opacity: 0,
          transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
        }}
      >
        {/* Spine / cover */}
        <div
          className="w-[60px] md:w-[80px] rounded-l-lg flex-shrink-0 relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${book.coverColor} 0%, ${book.spineColor} 100%)`,
            boxShadow: `inset -8px 0 16px rgba(0,0,0,0.5), 6px 0 20px rgba(0,0,0,0.6)`,
            minHeight: 400,
          }}
        >
          {/* Metallic edges */}
          <div className="absolute top-0 left-0 right-0 h-[4px]" style={{
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.8,
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{
            background: 'linear-gradient(90deg, transparent 5%, #c9a44a 20%, #f0d98c 42%, #c9a44a 62%, transparent 95%)',
            opacity: 0.8,
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(110deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.04) 100%)',
          }} />
          {/* Vertical title on spine */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="text-white/90 text-base font-bold tracking-[4px] font-display drop-shadow-md"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              {book.title}
            </span>
            <span className="text-white/50 text-[10px] tracking-[2px] font-body"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              {book.author}
            </span>
          </div>
        </div>

        {/* Page content */}
        <motion.div
          className="w-[320px] md:w-[520px] rounded-r-lg overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #f8f4eb 0%, #f0ead8 50%, #e8e0c8 100%)',
            boxShadow: '8px 0 30px rgba(0,0,0,0.5), -2px 0 8px rgba(0,0,0,0.2)',
            minHeight: 400,
            maxHeight: '80vh',
          }}
          initial={{ x: 20, opacity: 0 }}
          animate={isOpen ? { x: 0, opacity: 1, transition: { delay: 0.15, duration: 0.4 } } : { x: 20, opacity: 0 }}
        >
          {/* Page texture */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(0,0,0,0.03) 28px, rgba(0,0,0,0.03) 29px)',
          }} />

          {/* Inner shadow (book gutter) */}
          <div className="absolute top-0 bottom-0 left-0 w-8" style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.08), transparent)',
          }} />

          {/* Text content */}
          <div className="relative p-8 md:p-10 overflow-y-auto" style={{ maxHeight: '80vh' }}>
            <h2 className="text-ambient-deep/90 text-xl font-bold font-display mb-6 tracking-wide">
              {book.title}
            </h2>
            <p className="text-ambient-deep/70 text-sm font-body leading-[2] whitespace-pre-line">
              {sampleText.trim()}
            </p>
            <div className="mt-8 text-ambient-deep/30 text-xs font-body text-center">
              — 试读结束 —
            </div>
          </div>

          {/* Page corner fold */}
          <div className="absolute bottom-0 right-0 w-0 h-0"
            style={{
              borderStyle: 'solid',
              borderWidth: '0 0 24px 24px',
              borderColor: 'transparent transparent #030408 transparent',
              opacity: 0.06,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Close hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.5, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-white/40 text-xs tracking-[3px] font-display uppercase">
          Click outside to close
        </span>
      </motion.div>
    </motion.div>
  )
}
