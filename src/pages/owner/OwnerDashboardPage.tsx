import { Link } from 'react-router-dom'
import { Badge, Button, EmptyState, SaleThumb, Skeleton } from '../../components'
import {
  useDashboard,
  useDashboardStream,
  useMyStore,
  useStoreSales,
  useUpdateSale,
} from '../../hooks'
import { cn } from '../../lib/cn'
import { formatHHmm, formatWon } from '../../lib/format'
import type { Sale } from '../../types'

export function OwnerDashboardPage() {
  useDashboardStream()
  const { data: dash, isLoading } = useDashboard()
  const { data: store } = useMyStore()
  const { data: sales } = useStoreSales(store?.id)

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">판매 모니터링</h1>
          <p className="mt-1 text-sm text-ink-500">
            {store ? `${store.name} · 실시간 현황` : '실시간 현황'}
          </p>
        </div>
        <Link to="/owner/sales/new">
          <Button className="rounded-[12px]">+ 세일 등록</Button>
        </Link>
      </div>

      {/* 스탯 카드 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="진행 중 세일" value={dash && `${dash.active_sales}`} unit="건" loading={isLoading} />
        <StatCard label="오늘 주문" value={dash && `${dash.today_orders}`} unit="건" loading={isLoading} />
        <StatCard label="오늘 매출" value={dash && formatWon(dash.today_revenue)} highlight loading={isLoading} />
        <StatCard label="알림 발송" value={dash && `${dash.total_reach}`} unit="건" loading={isLoading} />
      </div>

      {/* 세일 목록 */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-ink-900">등록한 마감세일</h2>
        <div className="mt-3 overflow-hidden rounded-card-lg border border-line bg-surface">
          {sales && sales.length === 0 && (
            <EmptyState
              title="아직 등록한 세일이 없어요"
              description="첫 마감세일을 등록해 손님에게 알려보세요."
              action={
                <Link to="/owner/sales/new">
                  <Button size="sm">세일 등록하기</Button>
                </Link>
              }
            />
          )}
          {sales?.map((sale) => <SaleAdminRow key={sale.id} sale={sale} />)}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  highlight,
  loading,
}: {
  label: string
  value?: string | false
  unit?: string
  highlight?: boolean
  loading?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-card-lg border p-4',
        highlight ? 'border-primary-200 bg-primary-50' : 'border-line bg-surface',
      )}
    >
      <p className="text-[12px] text-ink-500">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-6 w-16" />
      ) : (
        <p
          className={cn(
            'mt-1.5 text-[22px] font-extrabold tnum',
            highlight ? 'text-primary-800' : 'text-ink-900',
          )}
        >
          {value || '-'}
          {unit && <span className="ml-0.5 text-[13px] font-semibold text-ink-400">{unit}</span>}
        </p>
      )}
    </div>
  )
}

function SaleAdminRow({ sale }: { sale: Sale }) {
  const update = useUpdateSale()
  const active = sale.status === 'active'
  const sold = sale.total_quantity - sale.remaining_quantity

  return (
    <div className="flex items-center gap-4 border-b border-line-soft px-5 py-4 last:border-0">
      <SaleThumb sale={sale} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-semibold text-ink-900">{sale.title}</p>
          <Badge tone={active ? 'success' : 'neutral'}>{active ? '판매중' : '마감'}</Badge>
        </div>
        <p className="mt-1 text-[13px] text-ink-500">
          <span className="font-semibold text-primary">{sale.discount_rate}%</span> ·{' '}
          <span className="line-through">{formatWon(sale.normal_price)}</span> →{' '}
          <span className="font-bold text-ink-900">{formatWon(sale.sale_price)}</span> · 마감{' '}
          {formatHHmm(sale.deadline_at)}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-[13px] font-semibold text-ink-900 tnum">
          {sold}/{sale.total_quantity}
        </p>
        <p className="text-[11px] text-ink-400">판매/전체</p>
      </div>
      {active && (
        <Button
          variant="ghost"
          size="sm"
          className="border border-line-strong"
          loading={update.isPending}
          onClick={() => update.mutate({ id: sale.id, payload: { status: 'closed' } })}
        >
          마감 처리
        </Button>
      )}
    </div>
  )
}
