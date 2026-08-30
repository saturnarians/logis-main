'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-[#D40511] text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
