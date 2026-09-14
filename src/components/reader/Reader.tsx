import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type {
  Book,
  BookContent,
  ReaderSettings,
  ReadingPosition,
} from '../../types/book'
import PageHeader from './PageHeader'
import Sheet from './Sheet'
import Icon from './Icon'
interface Props {
  book: Book
  content: BookContent
  storageError: boolean
  position?: ReadingPosition
  settings: ReaderSettings
  onSettings: (s: ReaderSettings) => void
  onPosition: (p: ReadingPosition) => void
  onBack: () => void
}
export default function Reader({
  book,
  content,
  storageError,
  position,
  settings,
  onSettings,
  onPosition,
  onBack,
}: Props) {
  const chapters = content.chapters
  const byId = chapters.findIndex((c) => c.id === position?.chapterId)
  const initial =
    byId >= 0
      ? byId
      : Math.max(0, Math.min(position?.chapter ?? 0, chapters.length - 1))
  const [chapterIndex, setChapter] = useState(initial)
  const [fraction, setFraction] = useState(position?.fraction ?? 0)
  const [panel, setPanel] = useState<'contents' | 'font' | 'theme' | null>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const previousChapter = useRef(initial)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const latest = useRef({ chapter: initial, fraction: position?.fraction ?? 0 })
  const callback = useRef(onPosition)
  callback.current = onPosition
  const chapter = chapters[chapterIndex]
  function publish() {
    callback.current({
      ...latest.current,
      chapterId: chapters[latest.current.chapter].id,
      contentRevision: content.revision,
      updatedAt: Date.now(),
    })
  }
  useEffect(() => {
    const visibility = () => {
      if (document.visibilityState === 'hidden') publish()
    }
    window.addEventListener('pagehide', publish)
    document.addEventListener('visibilitychange', visibility)
    publish()
    return () => {
      clearTimeout(saveTimer.current)
      publish()
      window.removeEventListener('pagehide', publish)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])
  useLayoutEffect(() => {
    const el = scroll.current
    if (!el) return
    const target =
      previousChapter.current === chapterIndex ? latest.current.fraction : 0
    previousChapter.current = chapterIndex
    latest.current = { chapter: chapterIndex, fraction: target }
    setFraction(target)
    el.scrollTop = target * Math.max(0, el.scrollHeight - el.clientHeight)
    publish()
  }, [chapterIndex])
  useLayoutEffect(() => {
    const el = scroll.current
    if (el)
      el.scrollTop =
        latest.current.fraction * Math.max(0, el.scrollHeight - el.clientHeight)
  }, [settings.fontSize, settings.fontFamily])
  function move(index: number) {
    setChapter(index)
    setPanel(null)
  }
  const total = (chapterIndex + fraction) / chapters.length
  return (
    <main
      className={`reader theme-${settings.theme}`}
      style={{ '--reading-size': `${settings.fontSize}px` } as CSSProperties}
    >
      <PageHeader title={book.title} onBack={onBack} note="阅读中" />
      <div
        ref={scroll}
        className={`reader-scroll font-${settings.fontFamily}`}
        onScroll={(e) => {
          const el = e.currentTarget
          const value =
            el.scrollHeight <= el.clientHeight
              ? 1
              : Math.max(
                  0,
                  Math.min(
                    1,
                    el.scrollTop / (el.scrollHeight - el.clientHeight),
                  ),
                )
          latest.current = { chapter: chapterIndex, fraction: value }
          setFraction(value)
          clearTimeout(saveTimer.current)
          saveTimer.current = setTimeout(publish, 250)
        }}
      >
        <article className="reader-content">
          <div className="eyebrow">
            {content.format === 'demo'
              ? '演示正文 · 非原著内容'
              : '私人导入 · ' + (book.edition || book.title)}
          </div>
          <span className="chapter-number">
            {String(chapterIndex + 1).padStart(2, '0')}
          </span>
          <h1 tabIndex={-1}>{chapter.title}</h1>
          {chapter.paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
          <div className="chapter-end">
            <Icon name="leaf" />
          </div>
          <nav className="chapter-nav" aria-label="章节翻页">
            <button
              disabled={chapterIndex === 0}
              onClick={() => move(chapterIndex - 1)}
            >
              上一章
            </button>
            {chapterIndex < chapters.length - 1 ? (
              <button onClick={() => move(chapterIndex + 1)}>
                下一章 <Icon name="arrow" />
              </button>
            ) : (
              <button
                onClick={() => {
                  latest.current.fraction = 1
                  publish()
                  onBack()
                }}
              >
                读完了，合上书
              </button>
            )}
          </nav>
        </article>
      </div>
      {storageError && (
        <p className="reader-save-error" role="status">
          阅读位置暂时未能完整保存，请保留当前页面。
        </p>
      )}
      <footer className="reader-toolbar">
        <div className="reader-progress">
          <span>
            {chapterIndex + 1} / {chapters.length} 章
          </span>
          <progress max={1} value={total} aria-label="当前阅读进度" />
          <span>{Math.round(total * 100)}%</span>
        </div>
        <nav aria-label="阅读工具">
          <button onClick={() => setPanel('contents')}>
            <Icon name="menu" />
            目录
          </button>
          <button aria-label="字体" onClick={() => setPanel('font')}>
            <span className="font-icon" aria-hidden="true">
              Aa
            </span>
            字体
          </button>
          <button onClick={() => setPanel('theme')}>
            <Icon name="sun" />
            主题
          </button>
        </nav>
      </footer>
      {panel && (
        <Sheet
          title={
            panel === 'contents'
              ? '目录'
              : panel === 'font'
                ? '文字与排版'
                : '阅读主题'
          }
          onClose={() => setPanel(null)}
        >
          {panel === 'contents' && (
            <ol className="contents-list">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    aria-current={i === chapterIndex ? 'true' : undefined}
                    onClick={() => move(i)}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {c.title}
                    {i === chapterIndex && <small>正在读</small>}
                  </button>
                </li>
              ))}
            </ol>
          )}
          {panel === 'font' && (
            <>
              <p className="setting-label">字号</p>
              <div className="option-row">
                {[17, 19, 21, 23, 25].map((size) => (
                  <button
                    key={size}
                    aria-pressed={settings.fontSize === size}
                    onClick={() => onSettings({ ...settings, fontSize: size })}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="setting-label">字体</p>
              <div className="option-row">
                <button
                  aria-pressed={settings.fontFamily === 'serif'}
                  onClick={() =>
                    onSettings({ ...settings, fontFamily: 'serif' })
                  }
                >
                  宋体 / 衬线
                </button>
                <button
                  aria-pressed={settings.fontFamily === 'sans'}
                  onClick={() =>
                    onSettings({ ...settings, fontFamily: 'sans' })
                  }
                >
                  黑体 / 无衬线
                </button>
              </div>
            </>
          )}
          {panel === 'theme' && (
            <ThemeOptions settings={settings} onSettings={onSettings} />
          )}
        </Sheet>
      )}
    </main>
  )
}
export function ThemeOptions({
  settings,
  onSettings,
}: {
  settings: ReaderSettings
  onSettings: (s: ReaderSettings) => void
}) {
  return (
    <div className="option-row theme-options">
      {(['paper', 'white', 'night'] as const).map((theme, i) => (
        <button
          key={theme}
          className={`theme-${theme}`}
          aria-pressed={settings.theme === theme}
          onClick={() => onSettings({ ...settings, theme })}
        >
          <span>字</span>
          {['暖纸', '素白', '夜读'][i]}
        </button>
      ))}
    </div>
  )
}
