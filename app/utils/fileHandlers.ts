import { MAX_VIDEO_SIZE, MAX_THUMBNAIL_SIZE } from '../constants/formConstants';

export const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: 'video' | 'thumbnail',
  setErrorMessage: (message: string | null) => void,
  setTempThumbnail: (file: File | null) => void,
  setShowCropModal: (show: boolean) => void,
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const maxSize = field === 'video' ? MAX_VIDEO_SIZE : MAX_THUMBNAIL_SIZE;
  if (file.size > maxSize) {
    setErrorMessage(`File size exceeds the maximum limit of ${maxSize / (1024 * 1024)} MB.`);
    return;
  }

  if (field === 'thumbnail') {
    setTempThumbnail(file);
    setShowCropModal(true);
  }
};
