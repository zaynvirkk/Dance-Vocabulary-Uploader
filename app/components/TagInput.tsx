import React, { useState, useEffect } from 'react';
import { Entry } from '../types/Entry';
import { inputStyle, buttonStyle, tagStyle } from '@/app/styles/uiStyles';

interface TagInputProps {
  entry: Entry;
  index: number;
  handleEntryChange: (index: number, field: keyof Entry, value: string | string[] | File | null) => void;
  previouslyUsedTags: string[];
  recommendedTags: string[];
}

function TagInput({ entry, index, handleEntryChange, previouslyUsedTags, recommendedTags }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [localStorageTags, setLocalStorageTags] = useState<string[]>([]);

  useEffect(() => {
    const storedTags = localStorage.getItem('usedTags');
    console.log('Stored tags from localStorage:', storedTags);
    if (storedTags) {
      const parsedTags = JSON.parse(storedTags);
      console.log('Parsed tags:', parsedTags);
      setLocalStorageTags(parsedTags);
    }
  }, []);

  useEffect(() => {
    console.log('localStorageTags state:', localStorageTags);
  }, [localStorageTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      const newTags = [...entry.tags, inputValue.trim()];
      handleEntryChange(index, 'tags', newTags);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = entry.tags.filter((tag) => tag !== tagToRemove);
    handleEntryChange(index, 'tags', newTags);
  };

  const addTag = (tag: string) => {
    if (!entry.tags.includes(tag)) {
      handleEntryChange(index, 'tags', [...entry.tags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {entry.tags.map((tag, tagIndex) => (
          <span
            key={tagIndex}
            className={tagStyle}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 text-gray-200 hover:text-white"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder="Add tags (press Enter to add)"
        className={`${inputStyle} w-full`}
      />
      {recommendedTags.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-400 mb-2">Recommended tags:</p>
          <div className="flex flex-wrap gap-2">
            {recommendedTags.map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(tag)}
                className={buttonStyle}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-400 mb-2">Previously used tags:</p>
        {localStorageTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {localStorageTags.map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(tag)}
                className={buttonStyle}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No previously used tags found.</p>
        )}
      </div>
    </div>
  );
}

export default TagInput;
