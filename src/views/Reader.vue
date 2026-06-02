<template>
  <div class="reader" :class="{ night: nightMode }">
    <header class="reader-header" :class="{ visible: showControls }">
      <button class="ctrl-btn" @click="goBack">← 返回</button>
      <span class="book-title">{{ book?.title }}</span>
      <button class="ctrl-btn" @click="toggleTheme">{{ nightMode ? '☀' : '☽' }}</button>
    </header>

    <div class="reader-content" ref="contentRef">
      <div class="page-area" @click="handleTap">
        <div class="chapter-label">{{ currentChapterTitle }}</div>
        <div class="page-body" v-html="currentPageHtml"></div>
      </div>
    </div>

    <footer class="reader-footer" :class="{ visible: showControls }">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
      <span class="progress-label">{{ progressPct.toFixed(1) }}%</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { books } from '../data/books'
import { useReaderStore } from '../store/reader'
import gsap from 'gsap'

const route = useRoute()
const router = useRouter()
const store = useReaderStore()
const bookId = route.params.bookId as string
const book = computed(() => books.find(b => b.id === bookId))

const nightMode = ref(store.nightMode)
const showControls = ref(false)
const contentRef = ref<HTMLElement>()
const pageIndex = ref(0)

const CHARS_PER_PAGE = 600

interface Page {
  chapterIdx: number
  chapterTitle: string
  content: string
}

const allPages = computed<Page[]>(() => {
  if (!book.value) return []
  const pages: Page[] = []
  book.value.chapters.forEach((raw, ci) => {
    const lines = raw.split('\n').filter(l => l.trim())
    const title = lines[0] || `第${ci + 1}章`
    const body = lines.slice(1).join('\n')
    const paras = body.split('\n').filter(p => p.trim())
    let buf = ''
    paras.forEach(p => {
      if (buf && (buf + p).length > CHARS_PER_PAGE) {
        pages.push({ chapterIdx: ci, chapterTitle: title, content: buf.trim() })
        buf = p
      } else {
        buf += (buf ? '\n\n' : '') + p
      }
    })
    if (buf.trim()) {
      pages.push({ chapterIdx: ci, chapterTitle: title, content: buf.trim() })
    }
  })
  return pages
})

const curPage = computed(() => allPages.value[pageIndex.value])
const currentChapterTitle = computed(() => curPage.value?.chapterTitle || '')
const currentPageHtml = computed(() => {
  const text = curPage.value?.content || ''
  return text.split('\n\n').map(p => `<p>${p}</p>`).join('')
})
const progressPct = computed(() => {
  if (allPages.value.length <= 1) return 0
  return (pageIndex.value / (allPages.value.length - 1)) * 100
})

function toggleTheme() {
  nightMode.value = !nightMode.value
  store.toggleNightMode()
}

function goBack() {
  save()
  router.push('/')
}

function handleTap(e: MouseEvent) {
  const x = e.clientX / window.innerWidth
  if (x < 0.3) turnPrev()
  else if (x > 0.7) turnNext()
  else showControls.value = !showControls.value
}

function turnNext() {
  if (pageIndex.value < allPages.value.length - 1) {
    pageIndex.value++
    animatePage(1)
    save()
  }
}

function turnPrev() {
  if (pageIndex.value > 0) {
    pageIndex.value--
    animatePage(-1)
    save()
  }
}

function animatePage(dir: number) {
  if (!contentRef.value) return
  gsap.fromTo(contentRef.value,
    { opacity: 0.4, x: dir * 30 },
    { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
  )
}

function save() {
  const ch = curPage.value?.chapterIdx ?? 0
  store.saveCurrentProgress(ch, progressPct.value)
}

// Touch swipe
let touchX = 0
function onTouchStart(e: TouchEvent) { touchX = e.touches[0].clientX }
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchX
  if (Math.abs(dx) > 50) dx < 0 ? turnNext() : turnPrev()
}

onMounted(() => {
  const saved = store.getBookProgress(bookId)
  if (saved) {
    const idx = allPages.value.findIndex(p => p.chapterIdx === saved.chapterIndex)
    if (idx >= 0) pageIndex.value = idx
  }
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })
})

onUnmounted(() => {
  save()
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
})
</script>

<style scoped>
.reader {
  width: 100%;
  height: 100%;
  background: var(--page-bg);
  color: var(--page-text);
  display: flex;
  flex-direction: column;
  transition: background 0.3s, color 0.3s;
  position: relative;
}
.reader.night {
  background: var(--night-bg);
  color: var(--night-text);
}

/* Top bar */
.reader-header {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 10px 16px;
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(12px);
  z-index: 100;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}
.reader-header.visible { transform: translateY(0); }

.ctrl-btn {
  color: #fff; font-size: 14px; padding: 7px 14px;
  border-radius: 8px; background: rgba(255,255,255,0.12);
}
.ctrl-btn:hover { background: rgba(255,255,255,0.22); }
.book-title {
  font-size: 14px; color: rgba(255,255,255,0.75);
  max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Content */
.reader-content {
  flex: 1; display: flex; justify-content: center;
  padding: 56px 22px 64px;
  overflow: hidden;
}
.page-area { max-width: 600px; width: 100%; }

.chapter-label {
  font-size: 19px; font-weight: 700;
  text-align: center; margin-bottom: 22px; opacity: 0.75;
}
.page-body :deep(p) {
  text-indent: 2em; line-height: 1.85; font-size: 17px;
  margin-bottom: 0.95em; text-align: justify;
}

/* Bottom bar */
.reader-footer {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 8px 16px 12px;
  display: flex; align-items: center; gap: 12px;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(12px);
  z-index: 100;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}
.reader-footer.visible { transform: translateY(0); }

.progress-track {
  flex: 1; height: 3px;
  background: rgba(255,255,255,0.18);
  border-radius: 2px; overflow: hidden;
}
.progress-fill {
  height: 100%; background: var(--accent);
  border-radius: 2px; transition: width 0.3s ease;
}
.progress-label {
  font-size: 12px; color: rgba(255,255,255,0.5);
  min-width: 46px; text-align: right;
}
</style>
