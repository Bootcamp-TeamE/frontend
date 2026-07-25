// 사진 데이터가 없어 카테고리별 톤으로 카드 썸네일을 대체한다.
// 색은 웜 페이퍼 + 딥 파인 그린 팔레트에 맞춘 뮤트 톤(사탕색 지양).
// 줄무늬 질감은 `thumb-stripe` 유틸(index.css)과 함께 쓴다.
const TINTS: Record<string, string> = {
  bakery: 'bg-[#e6d9b8] text-[#7c6f45]', // warm wheat
  butcher: 'bg-[#dec6c0] text-[#8a5f56]', // muted clay
  seafood: 'bg-[#c6d3d9] text-[#55707c]', // muted slate-blue
  greengrocer: 'bg-[#cbd8c1] text-[#566b4c]', // muted sage
  sidedish: 'bg-[#e3d4b4] text-[#7c6b42]',
  ricecake: 'bg-[#ddc9d2] text-[#7c5c69]', // muted mauve
  tofu_namul: 'bg-[#d3dcc1] text-[#5f6b46]',
  egg_dairy: 'bg-[#eaddb0] text-[#7f7040]',
  streetfood: 'bg-[#e6cdb4] text-[#86603c]',
  flower: 'bg-[#e1ccd1] text-[#7e5a66]',
}

export function categoryTint(code: string): string {
  return TINTS[code] ?? 'bg-[#ddd6c9] text-[#6f6a62]'
}

// 카테고리 식별용 점 색상(필터 레일에서 시각 구분). 톤은 팔레트에 맞춘 뮤트.
const DOTS: Record<string, string> = {
  butcher: '#b26a5c',
  seafood: '#557a88',
  greengrocer: '#5f8a54',
  sidedish: '#b58a3e',
  ricecake: '#b56f8a',
  tofu_namul: '#6f9a55',
  egg_dairy: '#c19a3a',
  streetfood: '#c07a44',
  flower: '#a86a9a',
}

export function categoryColor(code: string): string {
  return DOTS[code] ?? '#9a8f7e'
}
