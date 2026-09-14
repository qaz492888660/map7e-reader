/** UI-facing model. File importers can supply this without depending on demo data. */
export interface Book {
  id: string
  title: string
  author: string
  category: string
  description: string
  cover: { color: string; dark: string; motif: number; imageUrl?: string }
  initialProgress: number
}

export interface Chapter {
  id: string
  title: string
  paragraphs: string[]
}

export interface ReadingPosition {
  chapter: number
  fraction: number
  updatedAt: number
}

export interface ReaderSettings {
  fontSize: number
  fontFamily: 'serif' | 'sans'
  theme: 'paper' | 'white' | 'night'
  motion: boolean
}
