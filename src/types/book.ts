export interface ChapterSummary {
  id: string
  title: string
}
export interface Book {
  id: string
  title: string
  author: string
  edition?: string
  category: string
  description: string
  cover: { color: string; dark: string; motif: number; imageUrl?: string }
  readingProgress: number
  sourceType: 'demo' | 'private'
  availability: 'missing' | 'ready' | 'stored'
  chapters: ChapterSummary[]
  learningStage?: string
  tags?: string[]
  notesCount?: number
  learningStatus?: 'not-started' | 'learning' | 'completed'
}
export interface Chapter extends ChapterSummary {
  paragraphs: string[]
}
export interface BookContent {
  bookId: string
  revision: string
  format: 'demo' | 'txt'
  chapters: Chapter[]
}
export interface ReadingPosition {
  chapter: number
  chapterId?: string
  fraction: number
  updatedAt: number
  contentRevision?: string
}
export interface PrivateBookRecord {
  bookId: string
  metadata: Book
  file: Blob
  filename: string
  format: 'txt' | 'epub'
  revision: string
  importedAt: number
  content?: BookContent
}
export interface ReaderSettings {
  fontSize: number
  fontFamily: 'serif' | 'sans'
  theme: 'paper' | 'white' | 'night'
  motion: boolean
}
