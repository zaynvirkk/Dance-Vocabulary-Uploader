import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Entry } from '../types/Entry';
import { FaExchangeAlt } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import CropModal from './CropModal';
import TrimModal from './TrimModal';
import { uploadBgStyle } from '@/app/styles/uiStyles';

interface FileUploadProps {
  type: 'video' | 'thumbnail';
  entry: Entry;
  index: number;
  handleEntryChange: (index: number, field: keyof Entry, value: string | string[] | File | null) => void;
  maxSize: number;
}

function FileUpload({ type, entry, index, handleEntryChange, maxSize }: FileUploadProps) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setTempFile(acceptedFiles[0]);
      if (type === 'thumbnail') {
        setShowCropModal(true);
      } else {
        setShowTrimModal(true);
      }
    }
  }, [type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'video' ? { 'video/*': [] } : { 'image/*': [] },
    maxSize: maxSize,
    multiple: false
  });

  const handleCropSave = useCallback((croppedFile: File) => {
    handleEntryChange(index, 'thumbnail', croppedFile);
    setShowCropModal(false);
    setTempFile(null);
  }, [handleEntryChange, index]);

  const handleTrimSave = useCallback((trimmedFile: File) => {
    handleEntryChange(index, 'video', trimmedFile);
    const fileSizeMB = (trimmedFile.size / (1024 * 1024)).toFixed(2);
    handleEntryChange(index, 'fileSize', fileSizeMB);
    setShowTrimModal(false);
    setTempFile(null);
  }, [handleEntryChange, index]);

  const file = type === 'video' ? entry.video : entry.thumbnail;

  return (
    <div className="relative h-full">
      <div
        {...getRootProps()}
        className={`cursor-pointer ${uploadBgStyle} rounded-lg p-6 text-center transition-all duration-300 h-full flex flex-col justify-center items-center ${
          isDragActive ? 'bg-opacity-70' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          {file ? (
            <FaExchangeAlt className="text-4xl text-gray-300 mb-2" />
          ) : (
            <FiUpload className="text-6xl text-gray-300 mb-4" />
          )}
          <p className="text-gray-300 mb-2">
            {isDragActive ? `Drop the ${type} here` : file ? `Change ${type}` : `Drag and drop ${type} here, or click to select`}
          </p>
          {file && (
            <p className="text-gray-400 text-sm">
              {file.name} ({entry.fileSize ? `${entry.fileSize} MB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`})
            </p>
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
      {showTrimModal && tempFile && type === 'video' && (
        <TrimModal
          video={tempFile}
          onClose={() => setShowTrimModal(false)}
          onSave={handleTrimSave}
        />
      )}
    </div>
  );
}

export default FileUpload;
