import React, { useState } from 'react';
import Image from 'next/image';
import { Entry } from '../types/Entry';
import { FaTrash, FaTimes, FaVideo, FaImage, FaTag } from 'react-icons/fa';

interface EntryFormProps {
  entry: Entry;
  index: number;
  handleEntryChange: (index: number, field: keyof Entry, value: string | string[] | File | null) => void;
  removeEntry: (index: number) => void;
  setErrorMessage: (message: string | null) => void;
  showRemoveButton: boolean;
  previouslyUsedTags: string[];
}

const danceStyles = ['Cuban Salsa', 'Linear Salsa', 'Bachata'];
const levels = [
  { value: '1', label: '1 - Beginner' },
  { value: '2', label: '2 - Intermediate' },
  { value: '3', label: '3 - Advanced' },
  { value: '4', label: '4 - Expert' },
  { value: '5', label: '5 - Professional' }
];

const MAX_VIDEO_SIZE = 100;
const MAX_THUMBNAIL_SIZE = 20;

function EntryForm({ entry, index, handleEntryChange, removeEntry, setErrorMessage, showRemoveButton, previouslyUsedTags }: EntryFormProps) {
  const MAX_VIDEO_FILE_SIZE = MAX_VIDEO_SIZE * 1024 * 1024;
  const MAX_THUMBNAIL_FILE_SIZE = MAX_THUMBNAIL_SIZE * 1024 * 1024;
  const [inputTag, setInputTag] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'video' | 'thumbnail') => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (field === 'video') {
        if (file.type !== 'video/mp4') {
          setErrorMessage('Please upload an MP4 video file.');
          return;
        }
        if (file.size > MAX_VIDEO_FILE_SIZE) {
          setErrorMessage(`Video file size exceeds ${MAX_VIDEO_SIZE}MB limit.`);
          return;
        }
      } else if (field === 'thumbnail') {
        if (!file.type.startsWith('image/') || file.type === 'image/gif') {
          setErrorMessage('Please upload a JPG or PNG image file for the thumbnail.');
          return;
        }
        if (file.size > MAX_THUMBNAIL_FILE_SIZE) {
          setErrorMessage(`Thumbnail file size exceeds ${MAX_THUMBNAIL_SIZE}MB limit.`);
          return;
        }
      }
      handleEntryChange(index, field, file);
      setErrorMessage(null);
    } else {
      setErrorMessage('No file selected.');
    }
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputTag(value);

    if (value.endsWith(',')) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !entry.tags.includes(newTag)) {
        handleEntryChange(index, 'tags', [...entry.tags, newTag]);
      }
      setInputTag('');
    }
  };

  const handleAddTag = (tag: string) => {
    if (!entry.tags.includes(tag)) {
      handleEntryChange(index, 'tags', [...entry.tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleEntryChange(index, 'tags', entry.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 sm:p-6 space-y-6 relative">
      {showRemoveButton && (
        <button
          type="button"
          onClick={() => removeEntry(index)}
          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 flex items-center justify-center group"
          title="Remove Entry"
        >
          <FaTrash className="w-4 h-4" />
          <span className="absolute right-full mr-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Remove</span>
        </button>
      )}
      
      <input
        type="text"
        value={entry.title}
        onChange={(e) => handleEntryChange(index, 'title', e.target.value)}
        placeholder="Title"
        className="w-full p-2 sm:p-3 bg-gray-800 text-white rounded-md"
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <select
            value={entry.danceStyle}
            onChange={(e) => handleEntryChange(index, 'danceStyle', e.target.value)}
            className="w-full p-2 sm:p-3 bg-gray-800 text-white rounded-md appearance-none"
            required
          >
            <option value="">Select Dance Style</option>
            {danceStyles.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-green-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        <div className="relative">
          <select
            value={entry.level}
            onChange={(e) => handleEntryChange(index, 'level', e.target.value)}
            className="w-full p-2 sm:p-3 bg-gray-800 text-white rounded-md appearance-none"
            required
          >
            <option value="">Select Level</option>
            {levels.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-green-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center mb-2">
          <FaTag className="text-green-500 mr-2" />
          <input
            type="text"
            value={inputTag}
            onChange={handleTagInput}
            placeholder="Add tags (comma-separated)"
            className="flex-grow p-2 sm:p-3 bg-gray-800 text-white rounded-md"
          />
        </div>
        <div className="flex flex-wrap mt-2">
          {entry.tags.map((tag, tagIndex) => (
            <span key={tagIndex} className="bg-green-700 text-white px-2 py-1 rounded-full m-1 text-sm flex items-center">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-xs font-bold hover:text-red-400"
              >
                <FaTimes />
              </button>
            </span>
          ))}
        </div>
        {previouslyUsedTags.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-green-500 mb-1">Previously used tags:</p>
            <div className="flex flex-wrap">
              {previouslyUsedTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleAddTag(tag)}
                  className="bg-gray-800 text-white px-2 py-1 rounded-full m-1 text-sm hover:bg-gray-700"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center w-full">
          <label 
            htmlFor={`dropzone-file-${index}`} 
            className={`flex flex-col items-center justify-center w-full h-48 rounded-lg cursor-pointer transition-colors duration-300
              ${entry.video 
                ? 'bg-green-700 bg-opacity-20 hover:bg-opacity-30' 
                : 'bg-gray-800 hover:bg-gray-700'
              }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              {entry.video ? (
                <>
                  <FaVideo className="w-10 h-10 mb-3 text-green-400" />
                  <p className="mb-2 text-sm font-medium text-green-400">{entry.video.name}</p>
                  <p className="text-xs text-green-400">({(entry.video.size / (1024 * 1024)).toFixed(2)} MB)</p>
                </>
              ) : (
                <>
                  <FaVideo className="w-10 h-10 mb-3 text-green-500" />
                  <p className="mb-2 text-sm font-medium text-green-500"><span className="font-semibold">Click to upload video</span></p>
                  <p className="text-xs text-green-500">MP4 video (MAX. {MAX_VIDEO_SIZE}MB)</p>
                </>
              )}
            </div>
            <input 
              id={`dropzone-file-${index}`} 
              type="file" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'video')}
              accept="video/mp4"
              required
            />
          </label>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <label 
            htmlFor={`thumbnail-file-${index}`} 
            className={`flex flex-col items-center justify-center w-full h-48 rounded-lg cursor-pointer transition-colors duration-300
              ${entry.thumbnail 
                ? 'bg-green-700 bg-opacity-20 hover:bg-opacity-30' 
                : 'bg-gray-800 hover:bg-gray-700'
              }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              {entry.thumbnail ? (
                <>
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={URL.createObjectURL(entry.thumbnail)}
                      alt="Thumbnail"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <p className="mb-1 text-sm font-medium text-green-400">{entry.thumbnail.name}</p>
                  <p className="text-xs text-green-400">({(entry.thumbnail.size / (1024 * 1024)).toFixed(2)} MB)</p>
                </>
              ) : (
                <>
                  <FaImage className="w-10 h-10 mb-3 text-green-500" />
                  <p className="mb-2 text-sm font-medium text-green-500"><span className="font-semibold">Click to upload thumbnail</span></p>
                  <p className="text-xs text-green-500">JPG or PNG up to {MAX_THUMBNAIL_SIZE}MB</p>
                </>
              )}
            </div>
            <input 
              id={`thumbnail-file-${index}`} 
              type="file" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'thumbnail')}
              accept="image/jpeg,image/png"
              required
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default EntryForm;