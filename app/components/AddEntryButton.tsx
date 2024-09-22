import React from 'react';
import { FaPlus } from 'react-icons/fa';

interface AddEntryButtonProps {
  onClick: () => void;
}

function AddEntryButton({ onClick }: AddEntryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-lg transform hover:scale-105 transition duration-300 ease-in-out flex items-center"
    >
      <FaPlus className="mr-2" /> Add New Entry
    </button>
  );
}

export default AddEntryButton;