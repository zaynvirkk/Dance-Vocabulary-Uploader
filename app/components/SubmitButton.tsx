import React from 'react';
import { FaUpload } from 'react-icons/fa';

interface SubmitButtonProps {
  isUploading: boolean;
  isDisabled: boolean;
}

function SubmitButton({ isUploading, isDisabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isDisabled || isUploading}
      className={`px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-lg transform hover:scale-105 transition duration-300 ease-in-out flex items-center ${
        isDisabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isUploading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading...
        </span>
      ) : (
        <>
          <FaUpload className="mr-2" /> Submit All Entries
        </>
      )}
    </button>
  );
}

export default SubmitButton;