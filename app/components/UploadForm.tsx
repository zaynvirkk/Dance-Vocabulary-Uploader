import React, { useState, useEffect } from 'react';
import { Entry } from '../types/Entry';
import { uploadEntryWithVideo, DynamoDBError } from '../utils/dynamoDbUtils';
import EntryForm from './EntryForm';
import AddEntryButton from './AddEntryButton';
import SubmitButton from './SubmitButton';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { primaryBg, secondaryBg, glassEffect, primaryColor, gradientBg, buttonStyle } from '@/app/styles/uiStyles';
import { testAWSConnection } from '../utils/testAWS';

const RECOMMENDED_TAGS = [
  'step', 'combo', 'shines', 'rueda', 'performance',
  'breaks', 'socials', 'performance', 'turns', 'musicality',
  'shadow position', 'close hold', 'shadow position leader', 'sequence'
];

function UploadForm() {
  const [entries, setEntries] = useState<Entry[]>([
    { title: '', danceStyle: '', level: '', tags: ['step'], video: null, thumbnail: null }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previouslyUsedTags, setPreviouslyUsedTags] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedTags = localStorage.getItem('previouslyUsedTags');
    if (storedTags) {
      const parsedTags = JSON.parse(storedTags);
      setPreviouslyUsedTags(Array.from(new Set(parsedTags)));
    }
  }, []);

  const handleEntryChange = (index: number, field: keyof Entry, value: string | string[] | File | null) => {
    setEntries(prevEntries => {
      const newEntries = [...prevEntries];
      newEntries[index] = { ...newEntries[index], [field]: value };
      
      if ((field === 'video' || field === 'thumbnail') && value instanceof File) {
        const fileSizeMB = (value.size / (1024 * 1024)).toFixed(2);
        newEntries[index].fileSize = fileSizeMB;
      }
      
      return newEntries;
    });

    if (field === 'tags') {
      updatePreviouslyUsedTags(value as string[]);
    }
  };

  const updatePreviouslyUsedTags = (newTags: string[]) => {
    const updatedTags = Array.from(new Set([...previouslyUsedTags, ...newTags]));
    setPreviouslyUsedTags(updatedTags);
    localStorage.setItem('previouslyUsedTags', JSON.stringify(updatedTags));
  };

  const addEntry = () => {
    setEntries([...entries, { title: '', danceStyle: '', level: '', tags: ['step'], video: null, thumbnail: null }]);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = entries.filter(entry => 
      entry.title && 
      entry.danceStyle && 
      entry.level && 
      entry.video instanceof File && 
      entry.thumbnail instanceof File
    );

    if (validEntries.length === 0) {
      setErrorMessage("Please fill in all required fields and ensure both video and thumbnail are uploaded for at least one entry.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);
    try {
      let uploadedCount = 0;
      for (let i = 0; i < validEntries.length; i++) {
        try {
          await uploadEntryWithVideo(validEntries[i]);
          uploadedCount++;
        } catch (error) {
          console.error('Error uploading entry:', error);
          if (error instanceof DynamoDBError) {
            setErrorMessage(error.message);
            break;
          } else {
            throw error;
          }
        }
        setUploadProgress((i + 1) / validEntries.length * 100);
      }
      if (uploadedCount > 0) {
        setSuccessMessage(`Successfully uploaded ${uploadedCount} dance move${uploadedCount !== 1 ? 's' : ''}!`);
        setEntries([{ title: '', danceStyle: '', level: '', tags: ['step'], video: null, thumbnail: null }]);
      }
    } catch (error) {
      console.error('Error uploading dance moves: ', error);
      setErrorMessage(error instanceof Error ? `${error.name}: ${error.message}` : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.3)_0%,rgba(0,0,0,0)_30%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.3)_0%,rgba(0,0,0,0)_20%)]"></div>
      <div className="relative z-10 min-h-screen text-gray-100 p-2 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl mb-2 font-bold bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              Dance Vocabulary
            </h1>
            <p className="text-xl font-[300] text-gray-500">Upload Dance Moves</p>
          </header>
          <div className={`${secondaryBg} ${glassEffect} rounded-xl p-2 sm:p-8 shadow-2xl`}>
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {entries.map((entry, index) => (
                  <EntryForm
                    key={index}
                    entry={entry}
                    index={index}
                    handleEntryChange={handleEntryChange}
                    removeEntry={removeEntry}
                    setErrorMessage={setErrorMessage}
                    showRemoveButton={entries.length > 1}
                    recommendedTags={RECOMMENDED_TAGS}
                    previouslyUsedTags={previouslyUsedTags}
                  />
                ))}
              </div>
              {errorMessage && (
                <div className="mt-6 bg-red-900 bg-opacity-50 backdrop-blur-sm border border-red-500 text-red-100 p-4 rounded-md flex items-start">
                  <FaExclamationCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-300 mb-1">Error</h3>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}
              {successMessage && (
                <div className="mt-6 bg-emerald-900 bg-opacity-50 backdrop-blur-sm border border-emerald-500 text-emerald-100 p-4 rounded-md flex items-start">
                  <FaCheckCircle className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-emerald-300 mb-1">Success</h3>
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
                <AddEntryButton onClick={addEntry} />
                <SubmitButton 
                  isUploading={isUploading} 
                  isDisabled={!entries.some(entry => 
                    entry.title && 
                    entry.danceStyle && 
                    entry.level && 
                    entry.video instanceof File && 
                    entry.thumbnail instanceof File
                  )}
                />
              </div>
              {isUploading && (
                <div className="mt-4">
                  <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300 ease-in-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center mt-2 text-gray-300">Uploading: {uploadProgress.toFixed(0)}%</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadForm;
