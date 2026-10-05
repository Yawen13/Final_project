import React from 'react';

// An open circle — a stroke that never quite closes, which is the whole idea.
// `drawing` runs the stroke in and back out, used as the waiting indicator.
export default function InklingMark({ className = '', strokeWidth = 2.2, drawing = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3a9 9 0 1 1-6.36 2.64"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={drawing ? 'inkling-draw' : undefined}
      />
    </svg>
  );
}
