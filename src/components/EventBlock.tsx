import { Category, Scope } from '@/lib/types'
import CategoryTag from './CategoryTag'

interface Props {
  id: string
  title: string
  date: string
  category: Category
  scope: Scope
  tickers?: string[]
  userVote?: 'yes' | 'no' | null
  onClick?: (id: string) => void
  draggable?: boolean
  isPlaced?: boolean
  isFixedDate?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

export default function EventBlock({ id, title, date, category, scope, tickers, userVote, onClick, draggable = false, isPlaced = false, isFixedDate = false, onDragStart, onDragEnd }: Props) {
  const displayTicker = tickers && tickers.length > 0 ? tickers[0] : null
  const truncatedTitle = title.length > 30 ? `${title.slice(0, 30)}...` : title

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = isPlaced ? 'move' : 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify({ id, title, date, category, scope, tickers, isPlaced }))
    onDragStart?.()
  }

  const handleDragEnd = () => {
    onDragEnd?.()
  }

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick?.(id)}
      className={`text-xs px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity bg-white border border-gray-200 hover:border-gray-300 ${draggable ? 'cursor-move' : 'cursor-pointer'} ${isFixedDate ? 'opacity-75' : ''}`}
      title={isFixedDate ? 'Fixed date event - cannot be moved' : ''}
    >
      <div className="flex items-start gap-1">
        <CategoryTag category={category} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <div className="truncate font-medium text-gray-900">{truncatedTitle}</div>
            {isFixedDate && (
              <span className="text-xs text-gray-500" title="Fixed date - cannot be moved">🔒</span>
            )}
            {userVote && (
              <span className={`text-xs ${userVote === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                {userVote === 'yes' ? '👍' : '👎'}
              </span>
            )}
          </div>
          {displayTicker && (
            <div className="text-gray-500 text-xs mt-0.5">{displayTicker}</div>
          )}
        </div>
      </div>
    </div>
  )
}
