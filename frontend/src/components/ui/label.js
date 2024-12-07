// src/components/ui/label.js

import React from 'react';

const Label = ({ children, htmlFor, className }) => {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  );
};

export { Label };
