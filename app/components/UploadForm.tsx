import React, { useState, useEffect } from 'react';
import { Entry } from '../types/Entry';
import { uploadEntryWithVideo } from '../utils/firebaseUtils';
import EntryForm from './EntryForm';
import AddEntryButton from './AddEntryButton';
import SubmitButton from './SubmitButton';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const DEFAULT_TAGS = ['combo', 'step', 'shines', 'rueda'];

function UploadForm() {
  const [entries, setEntries] = useState<Entry[]>([
    { title: '', danceStyle: '', level: '', tags: [], video: null, thumbnail: null }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previouslyUsedTags, setPreviouslyUsedTags] = useState<string[]>(DEFAULT_TAGS);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedTags = localStorage.getItem('previouslyUsedTags');
    if (storedTags) {
      const parsedTags = JSON.parse(storedTags);
      setPreviouslyUsedTags(Array.from(new Set([...DEFAULT_TAGS, ...parsedTags])));
    }
  }, []);

  const handleEntryChange = (index: number, field: keyof Entry, value: string | string[] | File | null) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);

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
    setEntries([...entries, { title: '', danceStyle: '', level: '', tags: [], video: null, thumbnail: null }]);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entries.some(entry => !entry.title || !entry.danceStyle || !entry.level || !entry.video || !entry.thumbnail)) {
      setErrorMessage("Please fill in all required fields for each entry.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);
    try {
      let uploadedCount = 0;
      for (let i = 0; i < entries.length; i++) {
        try {
          await uploadEntryWithVideo(entries[i]);
          uploadedCount++;
        } catch (error: any) {
          if (error.message.includes("already exists")) {
            setErrorMessage(error.message);
            break;
          } else {
            throw error;
          }
        }
        setUploadProgress((i + 1) / entries.length * 100);
      }
      if (uploadedCount > 0) {
        setSuccessMessage(`Successfully uploaded ${uploadedCount} dance move${uploadedCount !== 1 ? 's' : ''}!`);
        setEntries([{ title: '', danceStyle: '', level: '', tags: [], video: null, thumbnail: null }]);
      }
    } catch (error: any) {
      console.error('Error uploading dance moves: ', error);
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 text-green-400">
            Dance Vocabulary
          </h1>
          <p className="text-xl text-green-600">Upload Dance Moves</p>
        </header>
        <div className="bg-gray-900 rounded-xl p-8 shadow-2xl">
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
              <div className="mt-6 bg-green-900 bg-opacity-50 backdrop-blur-sm border border-green-500 text-green-100 p-4 rounded-md flex items-start">
                <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-300 mb-1">Success</h3>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <AddEntryButton onClick={addEntry} />
              <SubmitButton 
                isUploading={isUploading} 
                isDisabled={entries.some(entry => !entry.title || !entry.danceStyle || !entry.level || !entry.video || !entry.thumbnail)} 
              />
            </div>
            {isUploading && (
              <div className="mt-4">
                <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-green-600 h-full transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-center mt-2 text-green-400">Uploading: {uploadProgress.toFixed(0)}%</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadForm;