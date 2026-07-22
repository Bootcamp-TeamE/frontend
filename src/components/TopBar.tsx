import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'

export function TopBar({ title }: { title?: string }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 flex items-center gap-1 border-b border-stone-100 bg-white/95 px-2 py-2.5 backdrop-blur">
      <button
        onClick={() => navigate(-1)}
        aria-label="뒤로"
        className="rounded-full p-1.5 text-stone-700 hover:bg-stone-100"
      >
        <ChevronLeftIcon />
      </button>
      {title && <h1 className="text-base font-bold text-stone-900">{title}</h1>}
    </header>
  )
}
