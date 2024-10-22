import React, { useRef, useState } from 'react';
import { Entry } from '../types/Entry';
import { FaCheckCircle, FaVideo, FaImage } from 'react-icons/fa';
import { uploadBgStyle } from '@/app/styles/uiStyles';
import CropModal from './CropModal';

interface FileUploadProps {
  type: 'video' | 'thumbnail';
  entry: Entry;
  index: number;
  handleEntryChange: (index: number, field: keyof Entry, value: string | string[] | File | null) => void;
  maxSize: number;
}

function FileUpload({ type, entry, index, handleEntryChange, maxSize }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (files[0].size > maxSize) {
      alert(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`);
      return;
    }
    if (type === 'thumbnail') {
      setTempFile(files[0]);
      setShowCropModal(true);
    } else {
      handleEntryChange(index, type, files[0]);
      const fileSizeMB = (files[0].size / (1024 * 1024)).toFixed(2);
      handleEntryChange(index, 'fileSize', fileSizeMB);
    }
  };

  const handleCropSave = (croppedFile: File) => {
    handleEntryChange(index, 'thumbnail', croppedFile);
    const fileSizeMB = (croppedFile.size / (1024 * 1024)).toFixed(2);
    handleEntryChange(index, 'fileSize', fileSizeMB);
    setShowCropModal(false);
    setTempFile(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const file = type === 'video' ? entry.video : entry.thumbnail;

  return (
    <div className="relative h-full aspect-square">
      <div
        className={`cursor-pointer ${uploadBgStyle} rounded-lg ${type === 'thumbnail' && file ? '' : 'p-6'} text-center transition-all duration-300 h-full flex flex-col justify-center items-center ${
          dragActive ? 'bg-opacity-70' : ''
        } ${file ? 'bg-green-500 bg-opacity-20 border-green-500' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'video' ? 'video/*' : 'image/*'}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <div className="flex flex-col items-center w-full h-full justify-center">
          {file ? (
            <>
              {type === 'video' && (
                <div className="bg-green-500 rounded-full p-2 mb-4">
                  <FaCheckCircle className="text-4xl text-white" />
                </div>
              )}
              {type === 'video' && <p className="text-gray-300 mb-2">{file.name}</p>}
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
                {dragActive
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
