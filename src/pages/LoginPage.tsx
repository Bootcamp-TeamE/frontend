import { GoogleLogin } from '@react-oauth/google'
import { useLocation, useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 로그인 유도 전 있던 페이지로 복귀. 없으면 홈. (점주도 대시보드로 튀지 않고 이전 페이지 유지)
  const from = (location.state as { from?: string } | null)?.from
  const login = useAuthStore((s) => s.login)

  async function finish(p: Promise<Awaited<ReturnType<typeof authApi.google>>>) {
    try {
      const { access_token, user } = await p
      login(access_token, user)
      navigate(from ?? '/', { replace: true })
    } catch (e) {
      toast(e instanceof Error ? e.message : '로그인에 실패했습니다')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold text-primary">SOLDE</h1>
      <p className="text-sm text-ink-500">동네 마감세일, 로그인하고 담아보세요</p>
      <GoogleLogin
        onSuccess={(c) => c.credential && finish(authApi.google(c.credential))}
        onError={() => toast('구글 로그인에 실패했습니다')}
      />
    </div>
  )
}
