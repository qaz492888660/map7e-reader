export interface ReadingProgress {
  chapterIndex: number
  progress: number
  lastRead: number
}

const STORAGE_KEY = 'map7e-reader-progress'

function loadAll(): Record<string, ReadingProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(data: Record<string, ReadingProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getProgress(bookId: string): ReadingProgress | null {
  const all = loadAll()
  return all[bookId] || null
}

export function saveProgress(bookId: string, chapterIndex: number, progress: number) {
  const all = loadAll()
  all[bookId] = { chapterIndex, progress, lastRead: Date.now() }
  saveAll(all)
}

export function getRecentReads(limit = 5): string[] {
  const all = loadAll()
  return Object.entries(all)
    .sort((a, b) => b[1].lastRead - a[1].lastRead)
    .slice(0, limit)
    .map(([id]) => id)
}
