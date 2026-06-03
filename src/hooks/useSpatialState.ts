import { useState, useCallback, useRef } from 'react'
import type { Book } from '../data/mockLibrary'

export type ScenePhase = 'wall' | 'shelfFocused' | 'bookPulled' | 'reading'

export function useSpatialState() {
  const [phase, setPhase] = useState<ScenePhase>('wall')
  const [focusedShelf, setFocusedShelf] = useState<number | null>(null)
  const [pulledBook, setPulledBook] = useState<Book | null>(null)
  const lockRef = useRef(false)

  const focusShelf = useCallback((index: number) => {
    if (lockRef.current) return
    setFocusedShelf(index)
    setPhase('shelfFocused')
  }, [])

  const returnToWall = useCallback(() => {
    if (lockRef.current) return
    setFocusedShelf(null)
    setPulledBook(null)
    setPhase('wall')
  }, [])

  const pullBook = useCallback((book: Book) => {
    if (lockRef.current) return
    lockRef.current = true
    setPulledBook(book)
    setPhase('bookPulled')
    setTimeout(() => { lockRef.current = false }, 600)
  }, [])

  const returnToShelf = useCallback(() => {
    setPulledBook(null)
    setPhase('shelfFocused')
  }, [])

  const enterReading = useCallback(() => {
    if (!pulledBook) return
    setPhase('reading')
  }, [pulledBook])

  const closeReading = useCallback(() => {
    setPhase('shelfFocused')
    setPulledBook(null)
  }, [])

  return {
    phase,
    focusedShelf,
    pulledBook,
    focusShelf,
    returnToWall,
    pullBook,
    returnToShelf,
    enterReading,
    closeReading,
  }
}
