import { useMutation } from '@tanstack/react-query'
import { uploadsApi } from '../api'

export function useUploadImage() {
  return useMutation({ mutationFn: (file: File) => uploadsApi.uploadImage(file) })
}
