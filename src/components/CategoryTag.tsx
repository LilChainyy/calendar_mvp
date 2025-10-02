import { Category } from '@/lib/types'

interface Props {
  category: Category
}

const categoryConfig: Record<Category, { icon: string; color: string }> = {
  earnings: { icon: '📊', color: 'bg-event-earnings/10 text-event-earnings' },
  economic_data: { icon: '📈', color: 'bg-event-economic/10 text-event-economic' },
  fed_policy: { icon: '🏛️', color: 'bg-event-government/10 text-event-government' },
  gov_policy: { icon: '🏛️', color: 'bg-event-government/10 text-event-government' },
  regulatory: { icon: '💊', color: 'bg-event-regulatory/10 text-event-regulatory' },
  corporate_action: { icon: '🤝', color: 'bg-event-corporate/10 text-event-corporate' },
  macro_event: { icon: '🌍', color: 'bg-event-macro/10 text-event-macro' },
}

export default function CategoryTag({ category }: Props) {
  const config = categoryConfig[category]

  return (
    <span className={`inline-flex items-center text-xs px-1.5 py-0.5 rounded ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
    </span>
  )
}
