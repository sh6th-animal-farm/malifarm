import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
      <div className="bg-gray-800/90 backdrop-blur-sm text-white px-6 py-3 rounded-[var(--radius-s)] shadow-std font-caption-02 flex items-center">
        {message}
      </div>
    </div>
  );
}
