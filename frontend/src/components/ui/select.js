// src/components/ui/select.js

import React, { useState } from 'react';

const Select = ({ children, className }) => {
  return <div className={`relative ${className}`}>{children}</div>;
};

const SelectTrigger = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </button>
  );
};

const SelectContent = ({ children, className }) => {
  return (
    <div className={`absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg ${className}`}>
      {children}
    </div>
  );
};

const SelectItem = ({ children, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-500 hover:text-white ${className}`}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ children, className }) => {
  return <span className={`block px-4 py-2 text-sm text-gray-700 ${className}`}>{children}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
