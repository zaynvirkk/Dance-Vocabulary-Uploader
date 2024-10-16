import React, { useState, useCallback } from 'react';
import { Entry } from '../types/Entry';
import { FaTrash } from 'react-icons/fa';
import TrimModal from '@/app/components/TrimModal';
import FileUpload from '@/app/components/FileUpload';
import TagInput from '@/app/components/TagInput';
import { handleFileChange } from '@/app/utils/fileHandlers';
import { danceStyles, levels, MAX_VIDEO_SIZE, MAX_THUMBNAIL_SIZE } from '@/app/constants/formConstants';
import { secondaryBg, inputStyle, selectStyle, glassEffect, buttonStyle } from '@/app/styles/uiStyles';

interface EntryFormProps {
  entry: Entry;
  index: number;
  handleEntryChange: (index: number, field: keyof Entry, value: string | string[] | File | null) => void;
  removeEntry: (index: number) => void;
  setErrorMessage: (message: string | null) => void;
  showRemoveButton: boolean;
  previouslyUsedTags: string[];
  recommendedTags: string[];
}

function EntryForm({ entry, index, handleEntryChange, removeEntry, setErrorMessage, showRemoveButton, previouslyUsedTags, recommendedTags }: EntryFormProps) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [tempThumbnail, setTempThumbnail] = useState<File | null>(null);
  const [tempVideo, setTempVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleCropModalSave = useCallback((croppedImage: File, previewUrl: string) => {
    console.log("handleCropModalSave called", { croppedImage, previewUrl });
    
    try {
      handleEntryChange(index, 'thumbnail', croppedImage);
      console.log("handleEntryChange called for thumbnail");

      setThumbnailPreview(previewUrl);
      console.log("Thumbnail preview set");

      setTempThumbnail(croppedImage);
      console.log("Temp thumbnail set");

      setShowCropModal(false);
      console.log("Crop modal closed");

      console.log("After handleCropModalSave", { entry, thumbnailPreview: previewUrl });
    } catch (error) {
      console.error("Error in handleCropModalSave:", error);
    }
  }, [handleEntryChange, index, entry]);

  const handleFileChangeWrapper = (index: number, field: keyof Entry, value: string | File | string[] | null) => {
    console.log("handleFileChangeWrapper called", { field, value });
    if (value instanceof File) {
      const e = { target: { files: [value] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(e, field as 'video' | 'thumbnail', setErrorMessage, setTempVideo, () => {}, setShowTrimModal, () => {}, setIsUploading, setUploadProgress);
    } else {
      handleEntryChange(index, field, value);
    }
    console.log("After handleEntryChange", { entry });
  };

  console.log("EntryForm rendered", { entry, showCropModal, tempThumbnail, thumbnailPreview, handleCropModalSave: !!handleCropModalSave });

  return (
    <div className={`${secondaryBg} ${glassEffect} rounded-lg p-4 sm:p-6 space-y-6 relative`}>
      {showRemoveButton && (
        <button
          type="button"
          onClick={() => removeEntry(index)}
          className={`absolute top-2 right-2 p-2 ${buttonStyle} flex items-center justify-center group`}
          title="Remove Entry"
        >
          <FaTrash className="w-4 h-4" />
          <span className={`absolute right-full mr-2 ${buttonStyle} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>Remove</span>
        </button>
      )}
      
      <input
        type="text"
        value={entry.title}
        onChange={(e) => handleEntryChange(index, 'title', e.target.value)}
        placeholder="Title"
        className={`${inputStyle} w-full`}
        required
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <select
            value={entry.danceStyle}
            onChange={(e) => handleEntryChange(index, 'danceStyle', e.target.value)}
            className={`${selectStyle} w-full`}
            required
          >
            <option value="">Select Dance Style</option>
            {danceStyles.map((style: string) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <select
            value={entry.level}
            onChange={(e) => handleEntryChange(index, 'level', e.target.value)}
            className={`${selectStyle} w-full`}
            required
          >
            <option value="">Select Level</option>
            {levels.map((level: { value: string; label: string }) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>
      </div>

      <TagInput
        entry={entry}
        index={index}
        handleEntryChange={handleEntryChange}
        previouslyUsedTags={previouslyUsedTags}
        recommendedTags={recommendedTags}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileUpload
          type="video"
          entry={entry}
          index={index}
          handleEntryChange={handleFileChangeWrapper}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          maxSize={MAX_VIDEO_SIZE}
          setIsUploading={setIsUploading}
          setUploadProgress={setUploadProgress}
        />
        <FileUpload
          type="thumbnail"
          entry={entry}
          index={index}
          handleEntryChange={handleFileChangeWrapper}
          maxSize={MAX_THUMBNAIL_SIZE}
          setIsUploading={setIsUploading}
          setUploadProgress={setUploadProgress}
        />
      </div>

      {showTrimModal && tempVideo && (
        <TrimModal
          tempVideo={tempVideo}
          setShowTrimModal={setShowTrimModal}
          handleEntryChange={handleEntryChange}
          index={index}
          setIsUploading={setIsUploading}
          setUploadProgress={setUploadProgress}
        />
      )}
    </div>
  );
}

export default EntryForm;
