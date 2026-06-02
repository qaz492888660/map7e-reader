<template>
  <div class="book-anim-overlay" ref="overlay">
    <div class="book-anim" ref="bookEl">
      <div class="anim-spine" :style="{ backgroundColor: book.spineColor }">
        <span>{{ book.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import type { Book } from '../data/books'

const props = defineProps<{
  book: Book
  startRect: DOMRect | null
}>()

const emit = defineEmits<{
  complete: []
}>()

const overlay = ref<HTMLElement>()
const bookEl = ref<HTMLElement>()

onMounted(() => {
  if (!bookEl.value || !overlay.value || !props.startRect) return

  const rect = props.startRect
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2

  gsap.set(bookEl.value, {
    position: 'absolute',
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    transformPerspective: 800,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  })

  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  // Phase 1: Pull out from shelf
  tl.to(bookEl.value, {
    duration: 0.45,
    left: cx - rect.width * 0.75,
    top: cy - rect.height * 0.75,
    width: rect.width * 1.5,
    height: rect.height * 1.5,
    rotationY: -12,
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
    ease: 'power2.out'
  })

  // Phase 2: Open up and fade
  tl.to(bookEl.value, {
    duration: 0.4,
    left: cx - rect.width * 2,
    top: cy - rect.height * 1.8,
    width: rect.width * 4,
    height: rect.height * 3.6,
    rotationY: 0,
    borderRadius: '4px',
    ease: 'power2.inOut'
  })

  // Phase 3: Fade overlay
  tl.to(overlay.value, {
    duration: 0.25,
    opacity: 0,
    ease: 'power1.in'
  }, '-=0.15')
})
</script>

<style scoped>
.book-anim-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
}

.book-anim {
  transform-style: preserve-3d;
  border-radius: 2px 4px 4px 2px;
  overflow: hidden;
}

.anim-spine {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.9);
  font-size: 14px;
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 3px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
</style>
