import React from 'react';

export const Toast = ({ toast }) => {
  if (!toast) return null;

  const { title, description, variant } = toast;

  const backgroundColor = {
    success: 'bg-green-500',
    destructive: 'bg-red-500',
    info: 'bg-blue-500',
  }[variant] || 'bg-gray-500';

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded text-white ${backgroundColor}`}>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
};
