import { useState } from 'react';

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = ({ title, description, variant = 'success' }) => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000); // Auto-hide after 3 seconds
  };

  return {
    toast,
    showToast,
  };
};

export { useToast };
