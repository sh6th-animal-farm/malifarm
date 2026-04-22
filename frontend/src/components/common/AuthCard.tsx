import React from 'react';

type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
};

export default function AuthCard({
  title,
  description,
  children,
  leftIcon,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-lg">
      <div className="bg-white p-10 rounded-lg shadow-std relative">
        {leftIcon && <div className="absolute top-10 left-10">{leftIcon}</div>}
        <h2 className="font-header-02 text-gray-900 text-center mb-3">
          {title}
        </h2>

        {description && (
          <p className="font-body-01 text-gray-900 text-center mb-10">
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
