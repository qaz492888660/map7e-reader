import type { Book } from '../../types/book'
import BookCarousel from './BookCarousel'
import Icon from './Icon'
interface Props {
  books: Book[]
  selectedId: string
  onSelect: (id: string) => void
  onOpen: (book: Book) => void
  onNavigate: (page: 'library' | 'history' | 'settings') => void
  resume: Book
  progress: number
  motion: boolean
}
export default function Home({
  books,
  selectedId,
  onSelect,
  onOpen,
  onNavigate,
  resume,
  progress,
  motion,
}: Props) {
  return (
    <main className="home page">
      <header className="brand">
        <span className="brand-mark">
          <Icon name="leaf" />
        </span>
        <span>
          MAP7E <b>Reader</b>
        </span>
        <span className="brand-note">私人阅读空间</span>
      </header>
      <section className="greeting">
        <div className="eyebrow">
          <span /> SOMEWHERE IN THE CLOUDS
        </div>
        <h1 tabIndex={-1}>
          你好，枫<span>。</span>
        </h1>
        <p>留一点时间，给另一个世界。</p>
      </section>
      <div className="section-label">
        <span>云间书架</span>
        <span className="quiet">左右轻滑，挑一本书</span>
      </div>
      <BookCarousel
        books={books}
        selectedId={selectedId}
        onSelect={onSelect}
        onOpen={onOpen}
        motion={motion}
      />
      <nav className="bubble-nav" aria-label="书房入口">
        <button className="bubble bubble-resume" onClick={() => onOpen(resume)}>
          <Icon name="book" />
          <span className="bubble-label">继续阅读</span>
          <span className="bubble-book">{resume.title}</span>
          <span className="bubble-meta">
            读至 {Math.round(progress * 100)}% <Icon name="arrow" />
          </span>
        </button>
        <button
          className="bubble bubble-library"
          onClick={() => onNavigate('library')}
        >
          <Icon name="book" />
          <span className="bubble-label">书库</span>
          <span className="bubble-meta">我的收藏</span>
        </button>
        <button
          className="bubble bubble-history"
          onClick={() => onNavigate('history')}
        >
          <Icon name="history" />
          <span>阅读记录</span>
        </button>
        <button
          className="bubble bubble-settings"
          onClick={() => onNavigate('settings')}
        >
          <Icon name="settings" />
          <span>设置</span>
        </button>
        <span className="orbit-leaf" aria-hidden="true">
          <Icon name="leaf" />
        </span>
      </nav>
      <footer className="home-footer">
        <span /> 一隅书房，自在如枫 <span />
      </footer>
    </main>
  )
}
