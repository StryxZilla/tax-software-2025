import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorProps {
  message?: string;
}

export default function ValidationError({ message }: ValidationErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center mt-1 text-sm text-red-600">
      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
