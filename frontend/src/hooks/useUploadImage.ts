import { useMutation } from '@tanstack/react-query';
import { uploadImage } from '../services/api';

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
  });
}
