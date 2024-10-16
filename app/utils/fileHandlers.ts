import { MAX_VIDEO_SIZE, MAX_THUMBNAIL_SIZE } from '../constants/formConstants';

export const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: 'video' | 'thumbnail',
  setErrorMessage: (message: string | null) => void,
  setTempVideo: (file: File | null) => void,
  setTempThumbnail: (file: File | null) => void,
  setShowTrimModal: (show: boolean) => void,
  setShowCropModal: (show: boolean) => void,
  setIsUploading: (isUploading: boolean) => void,
  setUploadProgress: (progress: number) => void
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const maxSize = field === 'video' ? 1073741824 : MAX_THUMBNAIL_SIZE; // Increased video size to 1GB (1073741824 bytes)
  if (file.size > maxSize) {
    setErrorMessage(`File size exceeds the maximum limit of ${maxSize / (1024 * 1024)} MB.`);
    return;
  }

  if (field === 'video') {
    setTempVideo(file);
    setShowTrimModal(true);
    simulateUpload(setIsUploading, setUploadProgress);
  } else {
    setTempThumbnail(file);
    setShowCropModal(true);
  }
};

const simulateUpload = (
  setIsUploading: (isUploading: boolean) => void,
  setUploadProgress: (progress: number) => void
) => {
  setIsUploading(true);
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    setUploadProgress(progress);
    if (progress >= 100) {
      clearInterval(interval);
      setIsUploading(false);
    }
  }, 500);
};
