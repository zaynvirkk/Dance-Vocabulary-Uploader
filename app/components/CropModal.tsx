import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, PercentCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '@/app/utils/imageProcessing';
import { Entry } from '../types/Entry';

interface CropModalProps {
  tempThumbnail: File;
  setShowCropModal: (show: boolean) => void;
  onSave: (croppedImage: File) => void;
}

function CropModal({ tempThumbnail, setShowCropModal, onSave }: CropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(tempThumbnail);
    setImgSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [tempThumbnail]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, []);

  const onCropComplete = useCallback((crop: PixelCrop, percentCrop: PercentCrop) => {
    setCompletedCrop(crop);
  }, []);

  const handleSave = async () => {
    if (imgRef.current && completedCrop) {
      try {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);

        const croppedImageFile = new File([croppedImageBlob], 'thumbnail.jpg', { type: 'image/jpeg' });

        if (typeof onSave === 'function') {
          onSave(croppedImageFile);
        } else {
          console.error("onSave is not a function", { onSaveType: typeof onSave, onSave });
        }
        
        setShowCropModal(false);
      } catch (error) {
        console.error("Error in handleSave:", error);
      }
    } else {
      console.error("Cannot save: imgRef or completedCrop is null", { imgRef: !!imgRef.current, completedCrop });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-3xl w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Crop Thumbnail</h2>
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(c, percentCrop) => setCrop(c)}
            onComplete={onCropComplete}
            aspect={1}
          >
            <img ref={imgRef} src={imgSrc} alt="Crop preview" onLoad={onImageLoad} />
          </ReactCrop>
        )}
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded mr-2"
            onClick={() => setShowCropModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleSave}
          >
            Crop and Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropModal;
