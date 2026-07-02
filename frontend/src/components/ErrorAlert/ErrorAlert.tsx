import React from 'react';
import { GAlert } from '../Gamut';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={{ margin: '16px 0', width: '100%' }}>
      <GAlert type="error" onClose={onClose}>
        {message}
      </GAlert>
    </div>
  );
};
