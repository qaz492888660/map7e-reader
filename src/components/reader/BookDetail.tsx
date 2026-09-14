import type { Book } from '../../types/book'
import BookCover from './BookCover'
import PageHeader from './PageHeader'
import Icon from './Icon'
export default function BookDetail({
  book,
  progress,
  onBack,
  onRead,
}: {
  book: Book
  progress: number
  onBack: () => void
  onRead: () => void
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
        <p className="detail-author">{book.author}</p>
        <div className="detail-divider" />
        <p className="description">{book.description}</p>
        <div className="reading-status">
          <span>{progress > 0 ? '上次停在这里' : '还未翻开的世界'}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <progress max={1} value={progress} aria-label="阅读进度" />
        <button className="primary-button" onClick={onRead}>
          <Icon name="book" />
          {progress >= 1 ? '重新阅读' : progress > 0 ? '继续阅读' : '开始阅读'}
          <Icon name="arrow" />
        </button>
        <p className="demo-note">示例藏书 · 封面为书房设计，正文为演示片段</p>
      </section>
    </main>
  )
}
