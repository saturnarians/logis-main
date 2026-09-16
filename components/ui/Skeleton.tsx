import React from 'react';

/** Simple gray‑pulse placeholder used while async data loads. */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className ?? 'h-4 w-full'}`} />
);
