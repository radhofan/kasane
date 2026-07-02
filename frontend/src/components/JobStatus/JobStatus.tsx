import React from 'react';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { RefreshIcon } from '@codecademy/gamut-icons';
import { GCard, GText, GSpinner } from '../Gamut';

interface JobStatusProps {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalName: string;
  error?: string | null;
  refetchInterval: number | false;
}

export const JobStatus: React.FC<JobStatusProps> = ({
  jobId,
  status,
  originalName,
  error,
  refetchInterval,
}) => {
  return (
    <GCard className="job-status-card">
      <div className="job-status-header">
        <GText variant="title-sm" as="h4" className="job-filename">
          {originalName}
        </GText>
        <StatusBadge status={status} />
      </div>

      <div className="job-status-body">
        <GText variant="p-small" as="div" className="job-id-label">
          Job ID: <code>{jobId}</code>
        </GText>

        {status === 'pending' && (
          <div className="status-progress-info">
            <GSpinner />
            <GText variant="p-base" as="p" className="status-text">
              Queued: Waiting for worker to pick up...
            </GText>
          </div>
        )}

        {status === 'processing' && (
          <div className="status-progress-info">
            <GSpinner />
            <GText variant="p-base" as="p" className="status-text">
              Processing: Resizing to 1280px and converting to WebP...
            </GText>
          </div>
        )}

        {status === 'failed' && (
          <div className="status-error-info">
            <GText variant="p-base" as="p" className="status-text error-text">
              Failed: {error || 'An error occurred during processing.'}
            </GText>
          </div>
        )}

        {refetchInterval && (
          <div className="polling-indicator">
            <RefreshIcon className="icon-spin" size={14} style={{ marginRight: '6px' }} />
            <GText variant="p-small" as="span">
              Polling status every {refetchInterval / 1000}s
            </GText>
          </div>
        )}
      </div>
    </GCard>
  );
};

export default JobStatus;
