export function PagePlaceholder({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="px-5 pt-5">
      <h1 className="text-xl font-bold text-stone-900">{title}</h1>
      <p className="mt-1 text-sm text-stone-400">
        {description ?? '이 화면은 이후 이슈에서 구현됩니다.'}
      </p>
      <div className="mt-6 rounded-card border border-dashed border-stone-300 bg-stone-50 px-4 py-16 text-center text-sm text-stone-400">
        준비 중
      </div>
    </div>
  )
}
