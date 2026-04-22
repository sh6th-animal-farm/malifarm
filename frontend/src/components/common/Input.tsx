import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  height?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className = '',
    height = 50, // 기본값 50
    ...props
  },
  ref,
) {
  const heightMap = {
    36: 'h-[36px]',
    40: 'h-[40px]',
    42: 'h-[42px]',
    48: 'h-[48px]',
    50: 'h-[50px]',
  };

  const selectedHeight = heightMap[height as keyof typeof heightMap] ?? heightMap[50];

  return (
    <input
      {...props}
      ref={ref}
      className={`w-full ${selectedHeight} px-4 border border-gray-200
        rounded-[var(--radius-s)] font-caption-02 text-gray-900 bg-white
        transition-colors focus:outline-none focus:border-green-600 ${className}`}
    />
  );
});

export default Input;
