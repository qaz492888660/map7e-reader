<template>
  <div class="bookshelf">
    <header class="shelf-header">
      <h1>map7e 书架</h1>
      <button class="ai-btn" @click="goToAIFind">AI 找书</button>
    </header>

    <div class="shelves-container" ref="shelvesContainer">
      <div v-for="(shelf, shelfIndex) in shelves" :key="shelfIndex" class="shelf-row">
        <div class="shelf-scroll" ref="el => setShelfRef(el, shelfIndex)">
          <div class="shelf-surface">
            <BookSpine
              v-for="book in shelf"
              :key="book.id"
              :book="book"
              :is-recent="recentIds.includes(book.id)"
              @click="handleBookClick(book, $event)"
            />
          </div>
          <div class="shelf-front"></div>
        </div>
      </div>
    </div>

    <BookOpenAnim
      v-if="animatingBook"
      :book="animatingBook"
      :start-rect="animStartRect"
      @complete="onAnimComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { books, type Book } from '../data/books'
import { useReaderStore } from '../store/reader'
import BookSpine from '../components/BookSpine.vue'
import BookOpenAnim from '../components/BookOpenAnim.vue'

const router = useRouter()
const store = useReaderStore()

const recentIds = computed(() => store.recentReads())

const sortedBooks = computed(() => {
  const recent = recentIds.value
  const recentBooks = recent.map(id => books.find(b => b.id === id)).filter(Boolean) as Book[]
  const otherBooks = books.filter(b => !recent.includes(b.id))
  return [...recentBooks, ...otherBooks]
})

const shelves = computed(() => {
  const result: Book[][] = []
  const perShelf = 8
  for (let i = 0; i < sortedBooks.value.length; i += perShelf) {
    result.push(sortedBooks.value.slice(i, i + perShelf))
  }
  return result
})

const animatingBook = ref<Book | null>(null)
const animStartRect = ref<DOMRect | null>(null)

const shelfRefs: HTMLElement[] = []
function setShelfRef(el: any, index: number) {
  if (el) shelfRefs[index] = el
}

function goToAIFind() {
  router.push('/ai-find')
}

function handleBookClick(book: Book, event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  animStartRect.value = target.getBoundingClientRect()
  animatingBook.value = book
}

function onAnimComplete() {
  if (animatingBook.value) {
    store.openBook(animatingBook.value.id)
    router.push(`/read/${animatingBook.value.id}`)
  }
  animatingBook.value = null
  animStartRect.value = null
}

// Drag-to-scroll for shelves
function setupDragScroll(el: HTMLElement) {
  let isDown = false
  let startX = 0
  let scrollLeft = 0

  const onPointerDown = (e: PointerEvent) => {
    isDown = true
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    el.scrollLeft = scrollLeft - (x - startX)
  }
  const onPointerUp = () => { isDown = false }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointerleave', onPointerUp)
}

onMounted(() => {
  nextTick(() => {
    shelfRefs.forEach(el => {
      if (el) setupDragScroll(el)
    })
  })
})
</script>

<style scoped>
.bookshelf {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(180deg, #2c1a0e 0%, #1a1008 60%, #0f0a05 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.shelf-header {
  flex-shrink: 0;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.shelf-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1px;
}

.ai-btn {
  padding: 8px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ai-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102,126,234,0.4);
}

.shelves-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0 32px;
  -webkit-overflow-scrolling: touch;
}

.shelf-row {
  margin-bottom: 12px;
  padding: 0 16px;
}

.shelf-scroll {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0;
  cursor: grab;
  user-select: none;
  -webkit-overflow-scrolling: touch;
}

.shelf-scroll:active {
  cursor: grabbing;
}

.shelf-surface {
  display: flex;
  gap: 6px;
  padding: 10px 8px 0;
  min-width: min-content;
  /* Shelf shadow above the front panel */
  background: linear-gradient(180deg, transparent 80%, rgba(0,0,0,0.15) 100%);
  border-radius: 4px 4px 0 0;
}

.shelf-front {
  width: 100%;
  height: 18px;
  background: linear-gradient(180deg,
    #6b4226 0%,
    var(--shelf-wood) 30%,
    var(--shelf-wood-dark) 100%
  );
  border-radius: 0 0 6px 6px;
  box-shadow:
    0 6px 12px var(--shelf-shadow),
    inset 0 2px 4px rgba(255,255,255,0.08);
  position: relative;
}

.shelf-front::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255,255,255,0.1);
}

.shelf-scroll::-webkit-scrollbar {
  height: 0;
  display: none;
}
</style>
