import { useRef, useState } from 'react'
import type { ReaderSettings, ReadingPosition } from '../types/book'

const KEY = 'map7e-reader:v1'
const defaults: ReaderSettings = {
  fontSize: 19,
  fontFamily: 'serif',
  theme: 'paper',
  motion: true,
}
function readSaved() {
  const empty = {
    positions: {} as Record<string, ReadingPosition>,
    settings: defaults,
  }
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!value || typeof value !== 'object') return empty
    const positions: Record<string, ReadingPosition> = {}
    for (const [id, raw] of Object.entries(value.positions || {})) {
      const p = raw as ReadingPosition | null
      if (
        p &&
        Number.isInteger(p.chapter) &&
        p.chapter >= 0 &&
        Number.isFinite(p.fraction) &&
        p.fraction >= 0 &&
        p.fraction <= 1 &&
        Number.isFinite(p.updatedAt)
      )
        positions[id] = p
    }
    const s = value.settings || {}
    return {
      positions,
      settings: {
        fontSize: [17, 19, 21, 23, 25].includes(s.fontSize)
          ? s.fontSize
          : defaults.fontSize,
        fontFamily:
          s.fontFamily === 'sans' ? ('sans' as const) : ('serif' as const),
        theme: ['paper', 'white', 'night'].includes(s.theme)
          ? (s.theme as ReaderSettings['theme'])
          : defaults.theme,
        motion: typeof s.motion === 'boolean' ? s.motion : true,
      },
    }
  } catch {
    return empty
  }
}

export function useReaderState() {
  const [saved, setSaved] = useState(readSaved)
  const [storageError, setStorageError] = useState(false)
  const latest = useRef(saved)
  function save(next: typeof saved) {
    latest.current = next
    setSaved(next)
    // Write synchronously so pagehide/unmount also preserve the last reading position.
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }
  return {
    ...saved,
    storageError,
    setSettings: (settings: ReaderSettings) =>
      save({ ...latest.current, settings }),
    savePosition: (id: string, position: ReadingPosition) =>
      save({
        ...latest.current,
        positions: { ...latest.current.positions, [id]: position },
      }),
  }
}
