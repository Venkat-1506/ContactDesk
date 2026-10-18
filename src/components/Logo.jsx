import React from 'react';

export default function Logo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="People Atlas logo"
    >
      <circle cx="18" cy="18" r="16" stroke="#7A3E2B" strokeWidth="2.5" fill="#FAF6EF" />
      <circle cx="18" cy="12" r="4" fill="#7A3E2B" />
      <path d="M8 26C8 21.5817 12.0294 18 18 18C23.9706 18 28 21.5817 28 26H8Z" fill="#263F3A" />
      <path
        d="M23 14L26 11M26 11L23 8M26 11H30"
        stroke="#B4773C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25.5" cy="10.5" r="1" fill="#B4773C" />
    </svg>
  );
}
