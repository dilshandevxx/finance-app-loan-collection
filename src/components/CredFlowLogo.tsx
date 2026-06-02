import React from 'react';

export function CredFlowLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M 15 30 L 45 15 L 95 50 L 45 85 L 15 70 L 40 50 Z" 
        fill="#FFB800" 
        stroke="#FFB800"
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
