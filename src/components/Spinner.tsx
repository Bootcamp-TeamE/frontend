import { cn } from '../lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 animate-spin text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6z"
      />
    </svg>
  )
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Spinner className="h-7 w-7" />
    </div>
  )
}
