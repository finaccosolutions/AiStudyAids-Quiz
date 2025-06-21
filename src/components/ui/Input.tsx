import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isFullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  isFullWidth,
  ...props
}) => {
  const baseStyles = 'block bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors';
  
  const widthStyles = isFullWidth ? 'w-full' : '';
  
  const inputClasses = `
    ${baseStyles}
    ${widthStyles}
    ${className}
  `;
  
  return (
    <input
      className={inputClasses}
      {...props}
    />
  );
};