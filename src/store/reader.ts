import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { books, type Book } from '../data/books'
import { getProgress, saveProgress, getRecentReads } from '../utils/progress'

export const useReaderStore = defineStore('reader', () => {
  const currentBookId = ref<string | null>(null)
  const nightMode = ref(false)

  const currentBook = computed<Book | undefined>(() =>
    books.find(b => b.id === currentBookId.value)
  )

  function openBook(bookId: string) {
    currentBookId.value = bookId
  }

  function saveCurrentProgress(chapterIndex: number, progress: number) {
    if (currentBookId.value) {
      saveProgress(currentBookId.value, chapterIndex, progress)
    }
  }

  function getBookProgress(bookId: string) {
    return getProgress(bookId)
  }

  function recentReads() {
    return getRecentReads(8)
  }

  function toggleNightMode() {
    nightMode.value = !nightMode.value
  }

  return {
    currentBookId,
    currentBook,
    nightMode,
    openBook,
    saveCurrentProgress,
    getBookProgress,
    recentReads,
    toggleNightMode
  }
})
