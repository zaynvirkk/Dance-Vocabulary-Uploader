import React, { useState, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useDropzone } from 'react-dropzone';

const firebaseConfig = {
    apiKey: "AIzaSyCDEXkHwMZq1DrcGB_2TJd1R13pwTT68wk",
    authDomain: "dance-vocabulary-uploader.firebaseapp.com",
    projectId: "dance-vocabulary-uploader",
    storageBucket: "dance-vocabulary-uploader.appspot.com",
    messagingSenderId: "933742884431",
    appId: "1:933742884431:web:a2a452c0fb3aadf61b1c3a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

interface Entry {
  title: string;
  danceStyle: string;
  level: string;
  video: File | null;
}

function UploadForm() {
  const [entries, setEntries] = useState<Entry[]>([{ title: '', danceStyle: '', level: '', video: null }]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEntryChange = (index: number, field: keyof Entry, value: string | File | null) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { title: '', danceStyle: '', level: '', video: null }]);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entries.some(entry => !entry.title || !entry.danceStyle || !entry.level || !entry.video)) {
      setErrorMessage("Please fill in all fields for each entry.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      for (const entry of entries) {
        if (!entry.video) continue; // TypeScript check

        // Check if a dance move with the same title already exists
        const titleQuery = query(collection(db, 'danceMoves'), where('title', '==', entry.title));
        const titleQuerySnapshot = await getDocs(titleQuery);
        if (!titleQuerySnapshot.empty) {
          throw new Error(`A dance move with the title "${entry.title}" already exists.`);
        }

        // Check if a video with the same name already exists
        const videoRef = ref(storage, `videos/${entry.video.name}`);
        try {
          await getDownloadURL(videoRef);
          throw new Error(`A video with the name "${entry.video.name}" already exists.`);
        } catch (error: any) {
          if (error.code !== 'storage/object-not-found') {
            throw error;
          }
        }

        // Upload video to Firebase Storage
        await uploadBytes(videoRef, entry.video);
        const videoUrl = await getDownloadURL(videoRef);

        // Add dance move data to Firestore
        await addDoc(collection(db, 'danceMoves'), {
          title: entry.title,
          danceStyle: entry.danceStyle,
          level: entry.level,
          videoUrl,
        });
      }

      console.log('Dance moves successfully uploaded!');
      setEntries([{ title: '', danceStyle: '', level: '', video: null }]);
    } catch (error: any) {
      console.error('Error uploading dance moves: ', error);
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const VideoUploader = ({ index, entry }: { index: number; entry: Entry }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      handleEntryChange(index, 'video', acceptedFiles[0]);
    }, [index]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { 'video/*': ['.mp4'] },
      maxSize: 10 * 1024 * 1024, // 10MB
    });

    const removeVideo = () => {
      handleEntryChange(index, 'video', null);
    };

    return (
      <div className="mt-1">
        {!entry.video ? (
          <div
            {...getRootProps()}
            className={`flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md bg-gray-800 transition-all duration-300 ease-in-out ${
              isDragActive ? 'border-indigo-400' : 'hover:border-indigo-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-1 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex text-sm text-gray-400">
                <span className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 focus-within:ring-offset-gray-900">
                  Upload a video
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">MP4 up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-md">
            <div className="flex items-center">
              <div className="h-8 w-8 text-green-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{entry.video.name}</p>
                <p className="text-xs text-gray-400">{(entry.video.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeVideo}
              className="text-red-400 hover:text-red-300 transition duration-150 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-8 p-6 bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-100">Upload Dance Moves</h2>
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-900 border border-red-700 text-red-100 rounded">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        {entries.map((entry, index) => (
          <div key={index} className="border-b border-gray-700 pb-8 mb-8">
            <div className="mb-6">
              <label htmlFor={`title-${index}`} className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                id={`title-${index}`}
                type="text"
                value={entry.title}
                onChange={(e) => handleEntryChange(index, 'title', e.target.value)}
                placeholder="Title of the dance move"
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white transition duration-150 ease-in-out"
              />
            </div>
            <div className="mb-6">
              <label htmlFor={`danceStyle-${index}`} className="block text-sm font-medium text-gray-300 mb-2">Dance Style</label>
              <select
                id={`danceStyle-${index}`}
                value={entry.danceStyle}
                onChange={(e) => handleEntryChange(index, 'danceStyle', e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white transition duration-150 ease-in-out"
              >
                <option value="">Select dance style</option>
                <option value="linear_salsa">Linear Salsa</option>
                <option value="cuban_salsa">Cuban Salsa</option>
                <option value="bachata">Bachata</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor={`level-${index}`} className="block text-sm font-medium text-gray-300 mb-2">Level</label>
              <select
                id={`level-${index}`}
                value={entry.level}
                onChange={(e) => handleEntryChange(index, 'level', e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white transition duration-150 ease-in-out"
              >
                <option value="">Select level</option>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Intermediate</option>
                <option value="3">3 - Advanced</option>
                <option value="4">4 - Expert</option>
                <option value="5">5 - Professional</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor={`video-${index}`} className="block text-sm font-medium text-gray-300 mb-2">Video</label>
              <VideoUploader index={index} entry={entry} />
            </div>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="mt-2 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition duration-150 ease-in-out"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addEntry}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition duration-150 ease-in-out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Another Dance Move
        </button>
        <button
          type="submit"
          disabled={isUploading || entries.some(entry => !entry.title || !entry.danceStyle || !entry.level || !entry.video)}
          className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition duration-150 ease-in-out ${(isUploading || entries.some(entry => !entry.title || !entry.danceStyle || !entry.level || !entry.video)) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {isUploading ? 'Uploading...' : 'Upload Dance Moves'}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;