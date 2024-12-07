// src/components/ui/switch.js
import React from 'react';

const Switch = ({ checked, onCheckedChange, className }) => {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onCheckedChange}
        className="sr-only" // Hide the default checkbox
      />
      <div className={`w-10 h-5 bg-gray-400 rounded-full shadow-inner transition duration-200 ease-in-out ${checked ? 'bg-green-500' : 'bg-gray-400'}`}>
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transform transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
    </label>
  );
};

export { Switch };