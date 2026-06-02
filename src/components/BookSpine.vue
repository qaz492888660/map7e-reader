<template>
  <div
    class="book-spine"
    :style="spineStyle"
    :class="{ 'is-recent': isRecent }"
  >
    <div class="spine-inner">
      <span class="spine-title">{{ book.title }}</span>
      <span class="spine-author">{{ book.author }}</span>
    </div>
    <div v-if="isRecent" class="recent-badge">最近</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Book } from '../data/books'

const props = defineProps<{
  book: Book
  isRecent?: boolean
}>()

const spineStyle = computed(() => ({
  backgroundColor: props.book.spineColor,
  boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.3), inset 2px 0 4px rgba(255,255,255,0.1)'
}))
</script>

<style scoped>
.book-spine {
  flex-shrink: 0;
  width: 42px;
  height: 180px;
  border-radius: 2px 4px 4px 2px;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  transform-origin: center bottom;
}

.book-spine:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0,0,0,0.5);
  z-index: 10;
}

.book-spine:active {
  transform: translateY(-4px) scale(1.02);
}

.spine-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 2px;
  overflow: hidden;
}

.spine-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgba(255,255,255,0.9);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  line-height: 1.4;
  max-height: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spine-author {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgba(255,255,255,0.6);
  font-size: 10px;
  margin-top: 8px;
  max-height: 60px;
  overflow: hidden;
}

.is-recent {
  border: 2px solid var(--accent);
}

.recent-badge {
  position: absolute;
  top: -8px;
  right: -4px;
  background: var(--accent);
  color: #1a1410;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
</style>
