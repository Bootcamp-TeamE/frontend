// 홈 히어로 배경 — 코드로 그린(SVG) 마켓 장면.
// 진열대·간판·청과 상자를 스타일화하고, 위/아래/왼쪽을 페이퍼색으로 페이드해
// 헤더·헤드라인·아래 리스트와 경계 없이 이어지게 한다. 마스코트는 이 위에 얹힌다.
export function HomeHeroBackdrop({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 430 210"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="hb-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f7f4ef" stopOpacity="1" />
          <stop offset="0.42" stopColor="#f7f4ef" stopOpacity="0.9" />
          <stop offset="0.72" stopColor="#f7f4ef" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f4ef" stopOpacity="1" />
          <stop offset="0.35" stopColor="#f7f4ef" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.34" stopColor="#f7f4ef" stopOpacity="0" />
          <stop offset="0.85" stopColor="#f7f4ef" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* 벽(페이퍼색으로 맞춰 경계 제거) · 바닥 */}
      <rect x="0" y="0" width="430" height="210" fill="#f7f4ef" />
      <rect x="0" y="152" width="430" height="58" fill="#ece3d2" />

      {/* 오른쪽 진열대 + 청과 */}
      <g>
        <rect x="250" y="44" width="184" height="114" rx="8" fill="#efe7d7" stroke="#e4d8c4" strokeWidth="1.5" />
        <rect x="250" y="82" width="184" height="3" fill="#e1d4bd" />
        <rect x="250" y="118" width="184" height="3" fill="#e1d4bd" />
        {[68, 104, 140].map((cy, r) =>
          [268, 285, 302, 319, 336, 353, 370, 387, 404].map((cx, i) => (
            <circle
              key={`${r}-${i}`}
              cx={cx}
              cy={cy}
              r="6"
              fill={['#cf5a44', '#e2924a', '#6c9a89', '#d98f6e', '#c9b64f'][(i + r) % 5]}
              opacity="0.7"
            />
          )),
        )}
      </g>

      {/* 매달린 간판 — FRESH FOOD (마스코트 왼쪽 상단) */}
      <g>
        <line x1="206" y1="0" x2="206" y2="46" stroke="#c9bda8" strokeWidth="1.5" />
        <line x1="262" y1="0" x2="262" y2="46" stroke="#c9bda8" strokeWidth="1.5" />
        <rect x="196" y="46" width="76" height="26" rx="5" fill="#173a2c" />
        <text
          x="234"
          y="63"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.2"
          fill="#eee6d4"
          fontFamily="inherit"
        >
          FRESH FOOD
        </text>
      </g>

      {/* 앞쪽 청과 상자 — 당근 */}
      <g>
        <rect x="238" y="152" width="80" height="28" rx="3" fill="#b47e44" />
        <rect x="238" y="152" width="80" height="9" rx="3" fill="#c9974f" />
        {[250, 262, 274, 286, 298, 306].map((x, i) => (
          <g key={i} transform={`translate(${x} 152) rotate(${-14 + (i % 3) * 12})`}>
            <path d="M0 0 L4 -13 L8 0 Z" fill="#e58a3c" />
            <path d="M2 -13 q2 -5 4 0" stroke="#5f8f57" strokeWidth="2" fill="none" />
          </g>
        ))}
      </g>

      {/* 크림 페이드 — 위(헤더) · 왼쪽(헤드라인) · 아래(리스트 연결) */}
      <rect x="0" y="0" width="300" height="210" fill="url(#hb-left)" />
      <rect x="0" y="0" width="430" height="72" fill="url(#hb-top)" />
      <rect x="0" y="64" width="430" height="146" fill="url(#hb-bottom)" />
    </svg>
  )
}
