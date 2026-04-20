import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  onClose,
  duration = 2000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
      <div className="bg-gray-800/90 backdrop-blur-sm text-white px-6 py-3 rounded-[var(--radius-s)] shadow-std font-caption-02 flex items-center">
        {message}
      </div>
    </div>
  );
}
