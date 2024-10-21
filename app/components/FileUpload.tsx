import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Entry } from '../types/Entry';
import { FaCheckCircle, FaVideo, FaImage } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import CropModal from './CropModal';
import { uploadBgStyle, buttonStyle } from '@/app/styles/uiStyles';

interface FileUploadProps {
  type: 'video' | 'thumbnail';
  entry: Entry;
  index: number;
  handleEntryChange: (index: number, field: keyof Entry, value: string | string[] | File | null) => void;
  maxSize: number;
}

function FileUpload({ type, entry, index, handleEntryChange, maxSize }: FileUploadProps) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);

  useEffect(() => {
    console.log(`FileUpload (${type}) - Current file:`, type === 'video' ? entry.video : entry.thumbnail);
  }, [entry, type]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log(`FileUpload (${type}) - File dropped:`, file);
      if (type === 'thumbnail') {
        setTempFile(file);
        setShowCropModal(true);
      } else {
        handleEntryChange(index, 'video', file);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        handleEntryChange(index, 'fileSize', fileSizeMB);
      }
    }
  }, [type, handleEntryChange, index]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'video' ? { 'video/*': [] } : { 'image/*': [] },
    maxSize: maxSize,
    multiple: false
  });

  const handleCropSave = useCallback((croppedFile: File) => {
    console.log(`FileUpload (${type}) - Cropped file saved:`, croppedFile);
    handleEntryChange(index, 'thumbnail', croppedFile);
    setShowCropModal(false);
    setTempFile(null);
  }, [handleEntryChange, index, type]);

  const file = type === 'video' ? entry.video : entry.thumbnail;

  return (
    <div className="relative h-full aspect-square">
      <div
        {...getRootProps()}
        className={`cursor-pointer ${uploadBgStyle} rounded-lg ${type === 'thumbnail' && file ? '' : 'p-6'} text-center transition-all duration-300 h-full flex flex-col justify-center items-center ${
          isDragActive ? 'bg-opacity-70' : ''
        } ${file ? 'bg-green-500 bg-opacity-20 border-green-500' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center w-full h-full justify-center">
          {file ? (
            <>
              {type === 'video' && (
                <div className="bg-green-500 rounded-full p-2 mb-4">
                  <FaCheckCircle className="text-4xl text-white" />
                </div>
              )}
              { type === 'video' && <p className="text-gray-300 mb-2">{file.name}</p>}
              {type === 'thumbnail' && (
                <div className="w-full h-full relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Uploaded thumbnail"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {type === 'video' ? (
                <FaVideo className="text-6xl text-gray-300 mb-4" />
              ) : (
                <FaImage className="text-6xl text-gray-300 mb-4" />
              )}
              <p className="text-gray-300 mb-2">
                {isDragActive
                  ? `Drop the ${type} here`
                  : `Drag and drop ${type} here, or click to select`}
              </p>
            </>
          )}
        </div>
      </div>
      {showCropModal && tempFile && type === 'thumbnail' && (
        <CropModal
          tempThumbnail={tempFile}
          setShowCropModal={setShowCropModal}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}

export default FileUpload;
