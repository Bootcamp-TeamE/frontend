import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const devEnabled = import.meta.env.VITE_DEV_LOGIN === 'true'

  async function finish(p: Promise<Awaited<ReturnType<typeof authApi.google>>>) {
    try {
      const { access_token, user } = await p
      login(access_token, user)
      navigate(user.role === 'owner' ? '/owner' : '/', { replace: true })
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
      {devEnabled && (
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={() => finish(authApi.devLogin('buyer@solde.demo'))}
          >
            데모 구매자
          </button>
          <button
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={() => finish(authApi.devLogin('owner@solde.demo'))}
          >
            데모 점주
          </button>
        </div>
      )}
    </div>
  )
}
