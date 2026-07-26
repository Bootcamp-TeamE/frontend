import { Link } from 'react-router-dom'
import { Button } from '../components'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-2xl font-extrabold text-stone-900">페이지를 찾을 수 없어요</p>
      <Link to="/">
        <Button variant="secondary">홈으로</Button>
      </Link>
    </div>
  )
}
