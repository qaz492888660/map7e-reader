import Icon from './Icon'
export default function PageHeader({
  title,
  onBack,
  note,
}: {
  title: string
  onBack: () => void
  note?: string
}) {
  return (
    <header className="page-header">
      <button className="icon-button glass" onClick={onBack} aria-label="返回">
        <Icon name="back" />
      </button>
      <span>{title}</span>
      <span className="header-note">{note || 'MAP7E'}</span>
    </header>
  )
}
