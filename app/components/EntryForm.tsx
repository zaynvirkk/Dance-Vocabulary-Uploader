import React, { useEffect } from 'react';
import { Entry } from '../types/Entry';
import { FaTrash } from 'react-icons/fa';
import FileUpload from '@/app/components/FileUpload';
import TagInput from '@/app/components/TagInput';
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
          handleEntryChange={handleEntryChange}
          maxSize={MAX_VIDEO_SIZE}
        />
        <FileUpload
          type="thumbnail"
          entry={entry}
          index={index}
          handleEntryChange={handleEntryChange}
          maxSize={MAX_THUMBNAIL_SIZE}
        />
      </div>
    </div>
  );
}

export default EntryForm;
