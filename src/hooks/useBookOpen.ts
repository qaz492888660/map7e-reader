import { useState, useCallback } from 'react'
import type { Book } from '../data/mockLibrary'

export function useBookOpen() {
  const [focusedBook, setFocusedBook] = useState<Book | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openBook = useCallback((book: Book) => {
    setFocusedBook(book)
    requestAnimationFrame(() => {
      setIsOpen(true)
    })
  }, [])

  const closeBook = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => {
      setFocusedBook(null)
    }, 500)
  }, [])

  return {
    focusedBook,
    isOpen,
    openBook,
    closeBook,
  }
}
