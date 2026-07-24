import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState, LoadingScreen } from '../../components'
import { useCategories, useCreateSale, useMyStore, useUnits, useUploadImage } from '../../hooks'
import { useAuthStore } from '../../store'
import { formatWon } from '../../lib/format'
import { cn } from '../../lib/cn'

const inputCls =
  'w-full rounded-card border border-line-strong bg-surface px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 focus:border-primary focus:outline-none'

// 마감세일은 대부분 '오늘 몇 시간 뒤' → 빠른 선택 칩.
const DEADLINE_PRESETS = [1, 2, 3, 6]

function toLocalInput(date: Date): string {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function OwnerSaleNewPage() {
  const ownerId = useAuthStore((s) => s.ownerId)
  const navigate = useNavigate()
  const { data: store, isLoading } = useMyStore(ownerId)
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const create = useCreateSale(store?.id ?? 0)
  const upload = useUploadImage()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('') // '' = 매장 카테고리 기본 단위 상속
  const [normal, setNormal] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [qty, setQty] = useState('')
  const [minOrder, setMinOrder] = useState('1')
  const [deadline, setDeadline] = useState('')
  const [activePreset, setActivePreset] = useState<number | null>(null)
  const [manualOpen, setManualOpen] = useState(false)

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  )

  if (isLoading) return <LoadingScreen />

  if (!store) {
    return (
      <EmptyState
        title="먼저 매장을 등록해 주세요"
        description="세일은 매장에 속합니다."
        action={
          <Button variant="secondary" onClick={() => navigate('/owner/store')}>
            매장 등록하러 가기
          </Button>
        }
      />
    )
  }

  const n = Number(normal) || 0
  const s = Number(salePrice) || 0
  const discount = n > 0 && s > 0 && s < n ? Math.round((1 - s / n) * 100) : 0
  const nowLocal = toLocalInput(new Date())
  const priceInvalid = n > 0 && s > 0 && s >= n
  const deadlinePast = !!deadline && deadline < nowLocal
  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleString('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null
  const valid = !!(
    title.trim() &&
    n > 0 &&
    s > 0 &&
    s < n &&
    Number(qty) > 0 &&
    deadline &&
    !deadlinePast
  )
  const submitting = create.isPending || upload.isPending

  const pickPreset = (hours: number) => {
    setDeadline(toLocalInput(new Date(Date.now() + hours * 3600 * 1000)))
    setActivePreset(hours)
  }

  const submit = async () => {
    let image_url: string | undefined
    if (imageFile) {
      try {
        image_url = await upload.mutateAsync(imageFile)
      } catch {
        return // 업로드 실패는 upload.isError로 표면화
      }
    }
    create.mutate(
      {
        title,
        description: description.trim() || undefined,
        image_url,
        category_code: category || store.category_code,
        unit_code: unit || undefined,
        normal_price: n,
        sale_price: s,
        total_quantity: Number(qty),
        min_order: Number(minOrder) || 1,
        deadline_at: new Date(deadline).toISOString(),
      },
      { onSuccess: () => navigate('/owner/dashboard') },
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-900">세일 등록</h1>
      <p className="mt-1 text-sm text-ink-500">{store.name}의 마감세일을 등록해요.</p>

      <div className="mt-6 rounded-card-lg border border-line bg-surface p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
          {/* 왼쪽: 이미지·설명 */}
          <div className="flex flex-col gap-5">
        {/* 상품 이미지 */}
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
            상품 이미지 (선택)
          </span>
          <label className="block cursor-pointer">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="미리보기"
                className="h-40 w-full rounded-card object-cover"
              />
            ) : (
              <div className="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-card border border-dashed border-line-strong bg-paper text-ink-400">
                <span className="text-[14px] font-semibold">이미지 선택</span>
                <span className="text-[12px]">없으면 카테고리 기본 이미지가 사용돼요</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {imageFile && (
            <button
              onClick={() => setImageFile(null)}
              className="mt-1.5 text-[13px] font-semibold text-ink-400"
            >
              이미지 제거
            </button>
          )}
        </div>

        <label className="flex flex-1 flex-col">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
            상품 설명 (선택)
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 오늘 구운 버터 크로와상, 마감 임박 특가"
            className={cn(inputCls, 'min-h-[120px] flex-1 resize-none')}
          />
        </label>
          </div>

          {/* 오른쪽: 나머지 */}
          <div className="space-y-5">
        <Field label="상품명">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 버터 크로와상"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="카테고리">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              <option value="">매장 기본</option>
              {categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name_ko}
                </option>
              ))}
            </select>
          </Field>
          <Field label="단위">
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls}>
              <option value="">매장 기본 단위</option>
              {units.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.name_ko}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="정상가 (원)">
            <input
              inputMode="numeric"
              value={normal ? Number(normal).toLocaleString('ko-KR') : ''}
              onChange={(e) => setNormal(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="5,000"
              className={inputCls}
            />
          </Field>
          <Field label="할인가 (원)">
            <input
              inputMode="numeric"
              value={salePrice ? Number(salePrice).toLocaleString('ko-KR') : ''}
              onChange={(e) => setSalePrice(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="2,500"
              className={inputCls}
            />
          </Field>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between rounded-card bg-primary-50 px-4 py-3">
            <span className="text-[13px] text-primary-800">적용 할인율</span>
            <span className="text-[15px] font-extrabold text-primary tnum">
              {discount}% · {formatWon(s)}
            </span>
          </div>
        )}
        {priceInvalid && (
          <p className="text-[13px] text-danger">할인가는 정상가보다 낮아야 해요.</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="총 수량">
            <input
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="10"
              className={inputCls}
            />
          </Field>
          <Field label="1인 최소 주문">
            <input
              inputMode="numeric"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1"
              className={inputCls}
            />
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">마감 시각</span>
          <div className="flex flex-wrap gap-2">
            {DEADLINE_PRESETS.map((h) => (
              <button
                key={h}
                onClick={() => {
                  pickPreset(h)
                  setManualOpen(false)
                }}
                className={cn(
                  'rounded-pill px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                  activePreset === h
                    ? 'bg-primary text-white'
                    : 'border border-line-strong bg-surface text-ink-600',
                )}
              >
                {h}시간 후
              </button>
            ))}
            <button
              onClick={() => setManualOpen((v) => !v)}
              className={cn(
                'rounded-pill px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                manualOpen || activePreset === null
                  ? 'bg-ink-900 text-white'
                  : 'border border-line-strong bg-surface text-ink-600',
              )}
            >
              직접 입력
            </button>
          </div>

          {manualOpen && (
            <input
              type="datetime-local"
              value={deadline}
              min={nowLocal}
              onChange={(e) => {
                setDeadline(e.target.value)
                setActivePreset(null)
              }}
              className={cn(inputCls, 'mt-2')}
            />
          )}

          {deadline && !deadlinePast && (
            <p className="mt-1.5 text-[13px] text-ink-500">
              마감 <span className="font-semibold text-ink-900">{deadlineLabel}</span>
            </p>
          )}
          {deadlinePast && (
            <p className="mt-1.5 text-[13px] text-danger">마감 시각은 현재 이후여야 해요.</p>
          )}
        </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {(create.isError || upload.isError) && (
            <p className="text-sm text-danger">
              {((create.error ?? upload.error) as Error)?.message ?? '등록에 실패했어요.'}
            </p>
          )}

          <Button
            fullWidth
            size="lg"
            className="rounded-[12px]"
            disabled={!valid || submitting}
            onClick={submit}
          >
            {upload.isPending ? '이미지 업로드 중…' : create.isPending ? '등록 중…' : '세일 등록하기'}
          </Button>
        </div>
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
