import { Link } from 'react-router-dom'
import { Card, EmptyState, HeartIcon, ListSkeleton, TopBar } from '../../components'
import { useCategories, useFavorites, useToggleFavorite } from '../../hooks'
import { useAuthStore } from '../../store'
import { categoryTint } from '../../lib/category'
import { cn } from '../../lib/cn'
import type { Store } from '../../types'

export function FavoritesPage() {
  const userId = useAuthStore((s) => s.userId)
  const { data: stores, isLoading } = useFavorites(userId)

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
        {stores?.map((store) => <FavoriteRow key={store.id} store={store} userId={userId} />)}
      </div>
    </>
  )
}

function FavoriteRow({ store, userId }: { store: Store; userId: number }) {
  const { data: categories = [] } = useCategories()
  const toggle = useToggleFavorite(userId)
  const catLabel =
    categories.find((c) => c.code === store.category_code)?.name_ko ?? store.category_code

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
