import React from "react";

type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-lg">
      <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-std">
        
        <h2 className="font-header-02 text-center mb-3">
          {title}
        </h2>

        {description && (
          <p className="font-body-01 text-center mb-10">
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
