import { useState, useCallback, useRef } from 'react'

export type ShelfState = 'idle' | 'hover' | 'pulledOut'

export function useShelfPhysics(shelfCount: number) {
  const [shelfStates, setShelfStates] = useState<ShelfState[]>(
    () => Array(shelfCount).fill('idle')
  )
  const [activeShelf, setActiveShelf] = useState<number | null>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setShelfState = useCallback((index: number, state: ShelfState) => {
    setShelfStates(prev => {
      const next = [...prev]
      next[index] = state
      return next
    })
  }, [])

  const onShelfHover = useCallback((index: number) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setShelfState(index, 'hover')
  }, [setShelfState])

  const onShelfLeave = useCallback((index: number) => {
    if (activeShelf === index) return
    hoverTimeout.current = setTimeout(() => {
      setShelfState(index, 'idle')
    }, 150)
  }, [activeShelf, setShelfState])

  const onShelfClick = useCallback((index: number) => {
    if (activeShelf === index) {
      setShelfState(index, 'idle')
      setActiveShelf(null)
      return
    }
    if (activeShelf !== null) {
      setShelfState(activeShelf, 'idle')
    }
    setShelfState(index, 'pulledOut')
    setActiveShelf(index)
  }, [activeShelf, setShelfState])

  const resetAll = useCallback(() => {
    setShelfStates(Array(shelfCount).fill('idle'))
    setActiveShelf(null)
  }, [shelfCount])

  return {
    shelfStates,
    activeShelf,
    onShelfHover,
    onShelfLeave,
    onShelfClick,
    resetAll,
  }
}
