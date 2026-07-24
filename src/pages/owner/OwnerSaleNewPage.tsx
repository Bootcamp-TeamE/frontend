import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState, LoadingScreen } from '../../components'
import { useCategories, useCreateSale, useMyStore, useUnits } from '../../hooks'
import { useAuthStore } from '../../store'
import { formatWon } from '../../lib/format'

const inputCls =
  'w-full rounded-card border border-line-strong bg-surface px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 focus:border-primary focus:outline-none'

export function OwnerSaleNewPage() {
  const ownerId = useAuthStore((s) => s.ownerId)
  const navigate = useNavigate()
  const { data: store, isLoading } = useMyStore(ownerId)
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const create = useCreateSale(store?.id ?? 0)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('') // '' = 매장 카테고리 기본 단위 상속
  const [normal, setNormal] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [qty, setQty] = useState('')
  const [minOrder, setMinOrder] = useState('1')
  const [deadline, setDeadline] = useState('')

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
  const valid = !!(title.trim() && n > 0 && s > 0 && s < n && Number(qty) > 0 && deadline)

  const submit = () => {
    create.mutate(
      {
        title,
        category_code: category || store.category_code,
        unit_code: unit || undefined, // 미선택 시 백엔드가 카테고리 기본 단위 상속
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
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-ink-900">세일 등록</h1>
      <p className="mt-1 text-sm text-ink-500">{store.name}의 마감세일을 등록해요.</p>

      <div className="mt-6 space-y-5 rounded-card-lg border border-line bg-surface p-6">
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
              value={normal}
              onChange={(e) => setNormal(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="5000"
              className={inputCls}
            />
          </Field>
          <Field label="할인가 (원)">
            <input
              inputMode="numeric"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="2500"
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

        <Field label="마감 시각">
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputCls}
          />
        </Field>

        {create.isError && (
          <p className="text-sm text-danger">
            {(create.error as Error)?.message ?? '등록에 실패했어요.'}
          </p>
        )}

        <Button
          fullWidth
          size="lg"
          className="rounded-[12px]"
          disabled={!valid}
          loading={create.isPending}
          onClick={submit}
        >
          세일 등록하기
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
