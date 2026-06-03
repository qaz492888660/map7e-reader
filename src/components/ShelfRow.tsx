import { motion } from 'framer-motion'
import BookCard from './BookCard'
import type { Book } from '../data/mockLibrary'
import type { ShelfState } from '../hooks/useShelfPhysics'

interface ShelfRowProps {
  index: number
  label: string
  books: Book[]
  state: ShelfState
  onHover: (index: number) => void
  onLeave: (index: number) => void
  onClick: (index: number) => void
  onBookSelect: (book: Book) => void
  isMobile: boolean
}

const shelfVariants = {
  idle: {
    z: 0,
    scale: 1,
    y: 0,
    filter: 'brightness(0.7) blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
  hover: {
    z: 30,
    scale: 1.02,
    y: -8,
    filter: 'brightness(0.9) blur(0px)',
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
  pulledOut: {
    z: 80,
    scale: 1.06,
    y: -16,
    filter: 'brightness(1.05) blur(0px)',
    transition: { type: 'spring', stiffness: 240, damping: 20 },
  },
}

const mobileVariants = {
  idle: { scale: 1, opacity: 0.85, transition: { duration: 0.3 } },
  hover: { scale: 1.01, opacity: 1, transition: { duration: 0.2 } },
  pulledOut: { scale: 1.02, opacity: 1, transition: { duration: 0.2 } },
}

export default function ShelfRow({
  index,
  label,
  books,
  state,
  onHover,
  onLeave,
  onClick,
  onBookSelect,
  isMobile,
}: ShelfRowProps) {
  const variants = isMobile ? mobileVariants : shelfVariants
  const isActive = state !== 'idle'

  return (
    <motion.div
      className="relative select-none"
      style={{
        transformStyle: 'preserve-3d',
        perspective: isMobile ? undefined : 1000,
      }}
      variants={variants}
      animate={state}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onLeave(index)}
      onClick={() => onClick(index)}
    >
      {/* Shelf label */}
      <motion.div
        className="mb-2 ml-1"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
      >
        <span className="text-gold/60 text-[11px] tracking-[3px] uppercase font-display font-semibold">
          {label}
        </span>
      </motion.div>

      {/* Shelf structure */}
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* Shadow beneath shelf */}
        <motion.div
          className="absolute -bottom-3 left-[5%] right-[5%] h-6 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
          animate={{
            opacity: state === 'pulledOut' ? 0.8 : state === 'hover' ? 0.5 : 0.3,
            scaleX: state === 'pulledOut' ? 1.1 : 1,
          }}
        />

        {/* Books row */}
        <div
          className="relative flex items-end gap-[7px] px-4 py-3"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08 + i * 0.04,
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <BookCard
                book={book}
                index={i}
                isShelfActive={isActive}
                onSelect={onBookSelect}
              />
            </motion.div>
          ))}
        </div>

        {/* Shelf surface (top of the wooden shelf) */}
        <div
          className="relative h-[10px] rounded-b-sm"
          style={{
            background: 'linear-gradient(180deg, #3d2a16 0%, #2a1a0e 40%, #1a1008 100%)',
            boxShadow: `
              inset 0 2px 3px rgba(255,255,255,0.04),
              0 6px 16px rgba(0,0,0,0.6)
            `,
          }}
        >
          {/* Front edge highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: isActive
                ? 'linear-gradient(90deg, transparent 5%, rgba(212,160,85,0.25) 30%, rgba(212,160,85,0.4) 50%, rgba(212,160,85,0.25) 70%, transparent 95%)'
                : 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.06) 50%, transparent 95%)',
              transition: 'background 0.4s ease',
            }}
          />
        </div>

        {/* Shelf front panel */}
        <div
          className="relative h-[18px] rounded-b-md overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #4a3020 0%, #3a2418 30%, #2a1a0e 70%, #1a1008 100%)',
            boxShadow: `
              0 8px 20px rgba(0,0,0,0.7),
              inset 0 1px 2px rgba(255,255,255,0.03)
            `,
          }}
        >
          {/* Wood grain lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)',
            }}
          />
        </div>

        {/* Shelf brackets */}
        <div className="absolute -bottom-6 left-10 w-3 h-7 rounded-b"
          style={{ background: 'linear-gradient(180deg, #3a2418, #2a1a0e)', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
        />
        <div className="absolute -bottom-6 right-10 w-3 h-7 rounded-b"
          style={{ background: 'linear-gradient(180deg, #3a2418, #2a1a0e)', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
        />
      </div>
    </motion.div>
  )
}
