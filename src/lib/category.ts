// 사진 데이터가 없어 카테고리별 톤으로 카드 썸네일을 대체한다.
const TINTS: Record<string, string> = {
  butcher: 'bg-rose-100 text-rose-700',
  seafood: 'bg-sky-100 text-sky-700',
  greengrocer: 'bg-emerald-100 text-emerald-700',
  sidedish: 'bg-amber-100 text-amber-700',
  ricecake: 'bg-fuchsia-100 text-fuchsia-700',
  tofu_namul: 'bg-lime-100 text-lime-700',
  egg_dairy: 'bg-yellow-100 text-yellow-700',
  streetfood: 'bg-orange-100 text-orange-700',
  flower: 'bg-pink-100 text-pink-700',
}

export function categoryTint(code: string): string {
  return TINTS[code] ?? 'bg-stone-100 text-stone-600'
}
