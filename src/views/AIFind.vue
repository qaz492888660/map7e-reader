<template>
  <div class="ai-find">
    <header class="ai-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>AI 找书</h1>
      <div class="ai-badge"><span class="dot"></span> 就绪</div>
    </header>

    <div class="ai-body">
      <div class="search-box">
        <input
          v-model="query"
          type="text"
          placeholder="描述你想看的书，如：主角无敌 不要后宫 字数500万以上"
          @keyup.enter="search"
        />
        <button class="search-btn" :disabled="!query.trim()" @click="search">搜索</button>
      </div>

      <div class="tags">
        <span v-for="tag in tags" :key="tag" class="tag" @click="applyTag(tag)">{{ tag }}</span>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>AI 正在分析您的需求…</p>
      </div>

      <div v-if="results.length" class="results">
        <div
          v-for="item in results"
          :key="item.book.id"
          class="result-card"
          @click="openBook(item.book.id)"
        >
          <div class="card-spine" :style="{ background: item.book.spineColor }">
            <span>{{ item.book.title }}</span>
          </div>
          <div class="card-body">
            <h3>{{ item.book.title }}</h3>
            <p class="author">{{ item.book.author }}</p>
            <p class="reason">{{ item.reason }}</p>
            <div class="score-row">
              <div class="score-bar"><div class="score-fill" :style="{ width: item.score + '%' }"></div></div>
              <span class="score-num">{{ item.score }}%</span>
            </div>
          </div>
        </div>
      </div>

      <p v-if="searched && !loading && !results.length" class="empty">
        暂无匹配，换个关键词试试？
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { books, type Book } from '../data/books'
import { useReaderStore } from '../store/reader'

const router = useRouter()
const store = useReaderStore()
const query = ref('')
const loading = ref(false)
const searched = ref(false)
const tags = ['热血逆袭', '轻松日常', '悬疑烧脑', '凡人修仙', '都市异能']

interface Result { book: Book; score: number; reason: string }
const results = ref<Result[]>([])

const REASONS = [
  '契合您描述的热血逆袭风格',
  '轻松无虐，适合休闲阅读',
  '剧情紧凑，节奏感极强',
  '经典佳作，口碑上乘',
  '世界观宏大，设定新颖',
  '与您的阅读偏好高度匹配',
  '文笔细腻，情感丰富',
  '新锐黑马作品，值得一读'
]

function applyTag(tag: string) { query.value = tag; search() }
function goBack() { router.push('/') }
function openBook(id: string) { store.openBook(id); router.push(`/read/${id}`) }

async function search() {
  if (!query.value.trim()) return
  loading.value = true; searched.value = true; results.value = []
  await new Promise(r => setTimeout(r, 1000 + Math.random() * 600))
  const keywords = query.value.toLowerCase().split(/\s+/)
  const scored = books.map(b => {
    let s = 60 + Math.random() * 25
    if (keywords.some(k => b.title.includes(k))) s += 15
    if (keywords.some(k => b.author.includes(k))) s += 10
    return { book: b, score: Math.min(99, Math.round(s)), reason: REASONS[Math.floor(Math.random() * REASONS.length)] }
  })
  results.value = scored.sort((a, b) => b.score - a.score).slice(0, 6)
  loading.value = false
}
</script>

<style scoped>
.ai-find {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  display: flex; flex-direction: column; overflow: hidden;
}

.ai-header {
  flex-shrink: 0;
  padding: 14px 20px;
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.ai-header h1 { font-size: 18px; color: #fff; }

.back-btn {
  color: #fff; font-size: 14px; padding: 7px 14px;
  border-radius: 8px; background: rgba(255,255,255,0.1);
}

.ai-badge {
  display: flex; align-items: center; gap: 6px;
  color: #4ade80; font-size: 12px;
}
.dot {
  width: 8px; height: 8px; background: #4ade80; border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50% { opacity: .5; transform: scale(1.3); }
}

.ai-body { flex: 1; overflow-y: auto; padding: 20px; -webkit-overflow-scrolling: touch; }

.search-box { display: flex; gap: 8px; margin-bottom: 14px; }
.search-box input {
  flex: 1; padding: 13px 16px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
  border-radius: 12px; color: #fff; font-size: 15px; outline: none;
}
.search-box input::placeholder { color: rgba(255,255,255,0.35); }
.search-box input:focus { border-color: #667eea; background: rgba(255,255,255,0.14); }

.search-btn {
  padding: 13px 22px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px; color: #fff; font-size: 15px; font-weight: 600;
}
.search-btn:disabled { opacity: .45; cursor: not-allowed; }

.tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
.tag {
  padding: 6px 14px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
  border-radius: 20px; color: rgba(255,255,255,0.65); font-size: 13px;
  cursor: pointer;
}
.tag:hover { background: rgba(255,255,255,0.14); }

.loading { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 36px 0; color: rgba(255,255,255,0.55); }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(255,255,255,0.18); border-top-color: #667eea;
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.results { display: flex; flex-direction: column; gap: 12px; }
.result-card {
  display: flex; gap: 14px; padding: 14px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; cursor: pointer;
  transition: background .2s, transform .2s;
}
.result-card:hover { background: rgba(255,255,255,0.12); transform: translateX(4px); }

.card-spine {
  flex-shrink: 0; width: 44px; height: 110px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset -3px 0 6px rgba(0,0,0,0.3), inset 2px 0 3px rgba(255,255,255,0.08);
}
.card-spine span {
  writing-mode: vertical-rl; text-orientation: mixed;
  color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 2px;
}

.card-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.card-body h3 { font-size: 15px; color: #fff; font-weight: 600; }
.card-body .author { font-size: 12px; color: rgba(255,255,255,0.45); }
.card-body .reason { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.4; margin-top: 3px; }

.score-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.score-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
.score-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 2px; }
.score-num { font-size: 12px; color: rgba(255,255,255,0.45); min-width: 38px; text-align: right; }

.empty { text-align: center; padding: 36px 0; color: rgba(255,255,255,0.45); }
</style>
