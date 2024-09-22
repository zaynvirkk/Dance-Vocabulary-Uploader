import React from 'react';

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 p-4 bg-red-900 border border-red-700 text-red-100 rounded">
      {message}
    </div>
  );
}

export default ErrorMessage;