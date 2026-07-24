import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, LoadingScreen } from '../../components'
import { useCategories, useCreateStore, useMyStore, useUpdateStore } from '../../hooks'
import { useAuthStore, useLocationStore } from '../../store'

const inputCls =
  'w-full rounded-card border border-line-strong bg-surface px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'

export function OwnerStorePage() {
  const ownerId = useAuthStore((s) => s.ownerId)
  const { lat, lng } = useLocationStore()
  const { data: store, isLoading } = useMyStore(ownerId)
  const { data: categories = [] } = useCategories()
  const create = useCreateStore()
  const update = useUpdateStore()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [address, setAddress] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!store) return
    setName(store.name)
    setCategory(store.category_code)
    setAddress(store.address ?? '')
  }, [store])

  // 신규 등록 시 기본 카테고리를 실제 목록의 첫 항목으로(존재하지 않는 코드로 422 나는 것 방지).
  useEffect(() => {
    if (store || categories.length === 0) return
    setCategory((c) => (categories.some((x) => x.code === c) ? c : categories[0].code))
  }, [store, categories])

  if (isLoading) return <LoadingScreen />

  const save = () => {
    setSaved(false)
    const payload = { name, category_code: category, address: address || null }
    if (store) {
      update.mutate({ id: store.id, payload }, { onSuccess: () => setSaved(true) })
    } else {
      // owner_id를 실어야 등록 매장이 점주에 귀속돼 대시보드에 잡힌다(1계정=1매장).
      create.mutate(
        { ...payload, lat, lng, owner_id: ownerId },
        { onSuccess: () => setSaved(true) },
      )
    }
  }

  const saving = create.isPending || update.isPending

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-ink-900">매장 관리</h1>
      <p className="mt-1 text-sm text-ink-500">
        {store ? '매장 정보를 수정할 수 있어요.' : '먼저 매장을 등록해 주세요.'}
      </p>

      <div className="mt-6 space-y-5 rounded-card-lg border border-line bg-surface p-6">
        <Field label="매장명">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 행복베이커리"
            className={inputCls}
          />
        </Field>

        <Field label="카테고리">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name_ko}
              </option>
            ))}
          </select>
        </Field>

        <Field label="주소">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="예: 서울 중구 회현동1가 12-3"
            className={inputCls}
          />
        </Field>

        {store && (
          <p className="text-[12px] text-ink-400">
            위치 좌표: {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
          </p>
        )}

        {(create.isError || update.isError) && (
          <p className="text-sm text-danger">
            {((create.error ?? update.error) as Error)?.message ?? '저장에 실패했어요.'}
          </p>
        )}
        {saved && <p className="text-sm font-semibold text-primary">저장되었습니다.</p>}

        <Button
          fullWidth
          size="lg"
          className="rounded-[12px]"
          disabled={!name.trim()}
          loading={saving}
          onClick={save}
        >
          {store ? '매장 정보 저장' : '매장 등록'}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">{label}</span>
      {children}
    </label>
  )
}
