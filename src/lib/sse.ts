import { API_ROOT, API_PREFIX } from './axios'

type Params = Record<string, string | number | boolean>

// SSE는 axios가 아니라 브라우저 EventSource로 연결한다(text/event-stream).
export function createEventSource(path: string, params: Params): EventSource {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString()
  return new EventSource(`${API_ROOT}${API_PREFIX}${path}?${qs}`)
}
