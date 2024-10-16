import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { buttonStyle } from '@/app/styles/uiStyles';

interface AddEntryButtonProps {
  onClick: () => void;
}

function AddEntryButton({ onClick }: AddEntryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${buttonStyle} flex items-center justify-center`}
    >
      <FaPlus className="mr-2" /> Add New Entry
    </button>
  );
}

export default AddEntryButton;
