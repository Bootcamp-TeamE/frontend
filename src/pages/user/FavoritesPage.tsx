import { Link } from 'react-router-dom'
import { Card, EmptyState, HeartIcon, ListSkeleton, TopBar } from '../../components'
import { useCategories, useFavorites, useStoreSales, useToggleFavorite } from '../../hooks'
import { categoryTint } from '../../lib/category'
import { cn } from '../../lib/cn'
import { formatHHmm } from '../../lib/format'
import type { Store } from '../../types'

export function FavoritesPage() {
  const { data: stores, isLoading } = useFavorites()

  return (
    <>
      <TopBar title="관심 매장" />
      {isLoading && (
        <div className="px-5 py-3">
          <ListSkeleton count={4} meta={false} />
        </div>
      )}
      {stores && stores.length === 0 && (
        <EmptyState
          title="관심 매장이 없어요"
          description="매장 상세에서 하트를 누르면 여기에 모여요."
        />
      )}
      <div className="space-y-2 px-5 py-3">
        {stores?.map((store) => <FavoriteRow key={store.id} store={store} />)}
      </div>
    </>
  )
}

function FavoriteRow({ store }: { store: Store }) {
  const { data: categories = [] } = useCategories()
  const toggle = useToggleFavorite()
  const { data: sales = [] } = useStoreSales(store.id)
  const catLabel =
    categories.find((c) => c.code === store.category_code)?.name_ko ?? store.category_code
  const activeSales = sales.filter((s) => new Date(s.deadline_at).getTime() > Date.now())
  const latest = activeSales.map((s) => s.deadline_at).sort().at(-1)

  return (
    <Card className="flex items-center gap-3 p-3">
      <Link to={`/stores/${store.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={cn('thumb-stripe h-12 w-12 shrink-0 rounded-thumb', categoryTint(store.category_code))}
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-ink-900">{store.name}</p>
          <p className="mt-0.5 truncate text-[12px] text-ink-400">
            {catLabel}
            {store.address ? ` · ${store.address}` : ''}
          </p>
          {activeSales.length > 0 && latest && (
            <p className="mt-0.5 text-[12px] font-semibold text-primary">
              진행 세일 {activeSales.length} · 오늘 {formatHHmm(latest)} 마감
            </p>
          )}
        </div>
      </Link>
      <button
        onClick={() => toggle.mutate({ storeId: store.id, favorited: true })}
        disabled={toggle.isPending}
        aria-label="관심 매장 해제"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-danger"
      >
        <HeartIcon className="h-6 w-6" filled />
      </button>
    </Card>
  )
}
