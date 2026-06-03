import { motion } from 'framer-motion'
import type { Book } from '../data/mockLibrary'

interface BookCardProps {
  book: Book
  index: number
  isShelfActive: boolean
  onSelect: (book: Book) => void
}

export default function BookCard({ book, index, isShelfActive, onSelect }: BookCardProps) {
  const altTilt = book.tilt
  const thickness = 32 + Math.random() * 16

  return (
    <motion.div
      className="relative cursor-pointer group"
      style={{ width: 52, height: 200, transformStyle: 'preserve-3d' }}
      initial={{ rotateZ: altTilt, y: 0 }}
      animate={{
        rotateZ: altTilt,
        y: 0,
        scale: 1,
        rotateY: 0,
      }}
      whileHover={{
        y: isShelfActive ? -18 : -10,
        scale: isShelfActive ? 1.08 : 1.04,
        rotateY: -4,
        rotateZ: 0,
        transition: { type: 'spring', stiffness: 300, damping: 22 },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(book)}
      tabIndex={0}
      role="button"
      aria-label={`Open ${book.title}`}
    >
      {/* Book body – 3D extrusion */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${thickness / 2}px)`,
        }}
      >
        {/* Spine face */}
        <div
          className="absolute inset-0 rounded-sm overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${book.coverColor} 0%, ${book.spineColor} 100%)`,
            boxShadow: `
              inset -6px 0 14px rgba(0,0,0,0.45),
              inset 4px 0 8px rgba(255,255,255,0.07),
              3px 0 10px rgba(0,0,0,0.5)
            `,
          }}
        >
          {/* Metallic edge top */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{
              background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
              opacity: 0.75,
            }}
          />
          {/* Metallic edge bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{
              background: 'linear-gradient(90deg, transparent 6%, #c9a44a 22%, #f0d98c 42%, #c9a44a 62%, transparent 94%)',
              opacity: 0.75,
            }}
          />
          {/* Shine sweep */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)',
            }}
          />
          {/* Fine vertical lines texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px)',
            }}
          />
          {/* Title + Author */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-1 gap-3">
            <span
              className="text-white/50 text-[9px] tracking-[2px] font-body"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', maxHeight: 55, overflow: 'hidden' }}
            >
              {book.author}
            </span>
            <span
              className="text-white/95 text-[13px] font-bold tracking-[3px] font-display drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', maxHeight: 140, overflow: 'hidden', lineHeight: 1.3 }}
            >
              {book.title}
            </span>
          </div>
          {/* Reading progress bar */}
          {book.readingProgress > 0 && (
            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[3px] rounded-full overflow-hidden bg-white/10" style={{ height: 40 }}>
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full"
                style={{
                  height: `${book.readingProgress * 100}%`,
                  background: 'linear-gradient(to top, #f0c966, #d4a055)',
                  boxShadow: '0 0 6px rgba(212,160,85,0.5)',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Page edges (right side) */}
      <div
        className="absolute top-0 h-full rounded-r-sm"
        style={{
          right: -6,
          width: 10,
          background: 'linear-gradient(90deg, #e8e0c8, #f5eed8 40%, #e8e0c8)',
          transform: `rotateY(90deg) translateZ(${thickness / 2 - 1}px)`,
          transformOrigin: 'left center',
          boxShadow: 'inset 0 0 6px rgba(0,0,0,0.15)',
        }}
      />

      {/* Bottom edge */}
      <div
        className="absolute left-0 right-0 rounded-b-sm"
        style={{
          bottom: -4,
          height: 8,
          background: 'linear-gradient(90deg, rgba(20,14,8,0.85), rgba(30,20,12,0.7) 50%, rgba(20,14,8,0.85))',
          transform: 'rotateX(90deg)',
          transformOrigin: 'top center',
        }}
      />

      {/* Hover glow ring */}
      <motion.div
        className="absolute -inset-2 rounded-md pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{
          opacity: 1,
          boxShadow: '0 0 18px rgba(212,160,85,0.35), 0 0 40px rgba(212,160,85,0.15)',
          borderColor: 'rgba(212,160,85,0.5)',
        }}
        style={{ border: '1.5px solid transparent' }}
      />

      {/* Tooltip on hover */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="bg-ambient-deep/95 border border-gold/20 rounded-lg px-3 py-1.5 backdrop-blur-md whitespace-nowrap">
          <div className="text-gold-bright text-xs font-semibold font-display">{book.title}</div>
          <div className="text-gold/50 text-[10px] font-body">{book.author}</div>
        </div>
      </div>
    </motion.div>
  )
}
