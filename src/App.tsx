import { useEffect, useState } from 'react'
import { books, sampleChapters } from './data/catalog'
import { usePage } from './hooks/usePage'
import { useReaderState } from './hooks/useReaderState'
import type { Book } from './types/book'
import Home from './components/reader/Home'
import Library from './components/reader/Library'
import BookDetail from './components/reader/BookDetail'
import Reader from './components/reader/Reader'
import PageHeader from './components/reader/PageHeader'
import { ReadingHistory, Settings } from './components/reader/PersonalPages'

export default function App() {
  const { page, navigate, back } = usePage()
  const { positions, settings, setSettings, savePosition, storageError } =
    useReaderState()
  const [homeBook, setHomeBook] = useState(books[2].id)
  const [libraryBook, setLibraryBook] = useState(books[2].id)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const selected =
    'bookId' in page ? books.find((b) => b.id === page.bookId) : undefined
  const recent =
    books
      .filter((b) => positions[b.id])
      .sort(
        (a, b) => positions[b.id].updatedAt - positions[a.id].updatedAt,
      )[0] || books[2]
  function progress(book: Book) {
    const position = positions[book.id]
    return position
      ? Math.min(
          1,
          (position.chapter + position.fraction) / sampleChapters.length,
        )
      : book.initialProgress
  }
  const open = (book: Book) => navigate({ name: 'book', bookId: book.id })
  useEffect(() => {
    document.title = `${selected ? selected.title + ' · ' : ''}MAP7E Reader`
    window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [page.name, selected?.id])
  if (page.name === 'reader' && selected)
    return (
      <Reader
        key={selected.id}
        book={selected}
        chapters={sampleChapters}
        position={positions[selected.id]}
        settings={settings}
        onSettings={setSettings}
        onPosition={(p) => savePosition(selected.id, p)}
        onBack={back}
      />
    )
  return (
    <div className={`reading-space ${settings.motion ? '' : 'motion-paused'}`}>
      <div className="sky" aria-hidden="true">
        <div className="cloud cloud-one" />
        <div className="cloud cloud-two" />
        <div className="sky-horizon" />
      </div>
      <div className="space-content">
        {page.name === 'home' && (
          <Home
            books={books.slice(0, 8)}
            selectedId={homeBook}
            onSelect={setHomeBook}
            onOpen={open}
            onNavigate={(name) => navigate({ name })}
            resume={recent}
            progress={progress(recent)}
            motion={settings.motion}
          />
        )}
        {page.name === 'library' && (
          <Library
            books={books}
            selectedId={libraryBook}
            onSelect={setLibraryBook}
            onOpen={open}
            onBack={back}
            motion={settings.motion}
            query={query}
            category={category}
            onQuery={setQuery}
            onCategory={setCategory}
          />
        )}
        {page.name === 'book' && selected && (
          <BookDetail
            book={selected}
            progress={progress(selected)}
            onBack={back}
            onRead={() => {
              if (!positions[selected.id] || progress(selected) >= 1) {
                const offset =
                  progress(selected) >= 1
                    ? 0
                    : progress(selected) * sampleChapters.length
                savePosition(selected.id, {
                  chapter: Math.floor(offset),
                  fraction: offset % 1,
                  updatedAt: Date.now(),
                })
              }
              navigate({ name: 'reader', bookId: selected.id })
            }}
          />
        )}
        {page.name === 'history' && (
          <ReadingHistory
            books={books}
            positions={positions}
            progress={progress}
            onOpen={open}
            onBack={back}
          />
        )}
        {page.name === 'settings' && (
          <Settings
            settings={settings}
            onSettings={setSettings}
            onBack={back}
            storageError={storageError}
          />
        )}
        {'bookId' in page && !selected && (
          <main className="page">
            <PageHeader title="书籍未找到" onBack={back} />
            <div className="empty-state">
              <h1 tabIndex={-1}>这本书不在书架上。</h1>
              <button
                className="primary-button"
                onClick={() => navigate({ name: 'library' }, true)}
              >
                回到书库
              </button>
            </div>
          </main>
        )}
        {storageError && page.name !== 'settings' && (
          <p className="storage-notice" role="status">
            浏览器暂时无法保存进度，本次阅读仍可继续。
          </p>
        )}
      </div>
    </div>
  )
}
