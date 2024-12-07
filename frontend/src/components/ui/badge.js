// src/components/ui/badge.js

import React from 'react';

const Badge = ({ text, type = 'default', className }) => {
  const badgeStyles = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-200 text-green-800',
    error: 'bg-red-200 text-red-800',
    warning: 'bg-yellow-200 text-yellow-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeStyles[type]} ${className}`}>
      {text}
    </span>
  );
};

export { Badge };
