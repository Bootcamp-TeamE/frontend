import { api } from '../lib/axios'

// 이미지 파일 업로드 → 저장 경로(/uploads/xxx.jpg) 반환.
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ url: string }>('/uploads/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}
