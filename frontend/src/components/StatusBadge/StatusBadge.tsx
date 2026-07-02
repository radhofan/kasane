import React from 'react';
import { GBadge } from '../Gamut';

interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getLabel = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Queued';
      default:
        return status;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'completed':
        return 'secondary';
      case 'failed':
        return 'primary';
      case 'processing':
        return 'accent';
      case 'pending':
      default:
        return 'tertiary';
    }
  };

  return (
    <GBadge variant={getVariant()} size="base">
      {getLabel()}
    </GBadge>
  );
};
export default StatusBadge;
