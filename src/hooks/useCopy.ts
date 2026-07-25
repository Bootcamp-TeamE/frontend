import { useCallback, useRef, useState } from 'react'

// 클립보드 복사 + 잠깐 '복사됨' 상태. clipboard API가 없으면 textarea 폴백.
export function useCopy(resetMs = 1500): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const copy = useCallback(
    (text: string) => {
      const done = () => {
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetMs)
      }
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done, () => setCopied(false))
        return
      }
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        done()
      } catch {
        setCopied(false)
      }
      ta.remove()
    },
    [resetMs],
  )

  return { copied, copy }
}
