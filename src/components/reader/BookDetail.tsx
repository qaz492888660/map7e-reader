import type { Book } from '../../types/book'
import BookCover from './BookCover'
import PageHeader from './PageHeader'
import Icon from './Icon'
export default function BookDetail({
  book,
  progress,
  onBack,
  onRead,
  onImport,
  loading,
  error,
  onRetry,
}: {
  book: Book
  progress: number
  onBack: () => void
  onRead: () => void
  onImport: () => void
  loading: boolean
  error: string
  onRetry: () => void
}) {
  return (
    <main className="detail page">
      <PageHeader title="书的一页" onBack={onBack} />
      <div className="detail-cover">
        <BookCover book={book} />
      </div>
      <section className="detail-info">
        <div className="eyebrow">{book.category} / 私人藏书</div>
        <h1 tabIndex={-1}>{book.title}</h1>
        <p className="detail-author">
          {book.author}
          {book.edition && <> · {book.edition}</>}
        </p>
        {book.learningStage && (
          <p className="learning-stage">{book.learningStage}</p>
        )}
        <div className="detail-divider" />
        <p className="description">{book.description}</p>
        <div className="reading-status">
          <span>
            {loading
              ? '正在读取本地书库'
              : book.availability !== 'ready'
                ? '正文文件尚未导入'
                : progress > 0
                  ? '上次停在这里'
                  : '还未翻开的世界'}
          </span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <progress max={1} value={progress} aria-label="阅读进度" />
        {error && (
          <p className="import-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="primary-button"
          disabled={loading}
          onClick={
            error ? onRetry : book.availability === 'ready' ? onRead : onImport
          }
        >
          <Icon name="book" />
          {loading
            ? '正在打开书库…'
            : error
              ? '重试打开书库'
              : book.availability !== 'ready'
                ? '导入书籍开始学习'
                : progress >= 1
                  ? '重新阅读'
                  : progress > 0
                    ? '继续阅读'
                    : '开始阅读'}
          <Icon name="arrow" />
        </button>
        {book.sourceType === 'private' && book.availability !== 'missing' && (
          <button className="text-button" onClick={onImport}>
            替换私人书籍文件
          </button>
        )}
        <p className="demo-note">
          {book.sourceType === 'demo'
            ? '示例藏书 · 封面为书房设计，正文为演示片段'
            : book.availability === 'stored'
              ? 'EPUB 已存本机 · 暂不支持解析正文'
              : 'MAP7E 自制书封 · 私人文件仅在本机保存'}
        </p>
        {book.sourceType === 'private' && (
          <section className="detail-contents">
            <h2>书中的路</h2>
            {book.chapters.length ? (
              <>
                <p>{book.chapters.length} 个阅读分段 · 来自导入文件</p>
                <ol>
                  {book.chapters.slice(0, 8).map((chapter) => (
                    <li key={chapter.id}>{chapter.title}</li>
                  ))}
                </ol>
                {book.chapters.length > 8 && (
                  <p>其余章节可在阅读页目录查看。</p>
                )}
              </>
            ) : (
              <p>
                待导入私人文件后生成目录；尚未录入{book.edition || '当前版本'}
                正式目录。
              </p>
            )}
          </section>
        )}
      </section>
    </main>
  )
}
