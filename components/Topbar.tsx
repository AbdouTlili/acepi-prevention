'use client'
import Icon from './Icon'

interface Props {
  title: string
  crumb?: string
  right?: React.ReactNode
  onSearch?: (q: string) => void  // only render search bar when provided
}

export default function Topbar({ title, crumb, right, onSearch }: Props) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        {crumb && <div className="crumbs"><span>{crumb}</span></div>}
      </div>
      <div className="topbar-right">
        {onSearch && (
          <div className="search">
            <Icon name="search" size={14} />
            <input
              placeholder="Nom, référence, ville…"
              onChange={e => onSearch(e.target.value)}
            />
            <kbd>⌘K</kbd>
          </div>
        )}
        {right}
      </div>
    </div>
  )
}
