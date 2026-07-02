import React from 'react';
import { GFillButton, GStrokeButton, GCard, GText } from '../Gamut';
import { CheckCircledIcon, DownloadIcon } from '@codecademy/gamut-icons';
import { getDownloadUrl } from '../../services/api';

interface DownloadSectionProps {
  jobId: string;
  originalName: string;
  onReset: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ jobId, originalName, onReset }) => {
  const downloadUrl = getDownloadUrl(jobId);

  return (
    <GCard className="download-card">
      <div className="download-header">
        <CheckCircledIcon size={40} className="success-icon" />
        <GText variant="title-md" as="h3" className="download-title">
          Image Optimized Successfully!
        </GText>
      </div>

      <div className="download-body">
        <GText variant="p-base" as="p" className="download-info-text">
          Your image <strong>{originalName}</strong> has been processed:
        </GText>
        <ul className="optimization-specs">
          <li>
            <GText variant="p-base" as="span">
              Converted to modern high-efficiency <strong>WebP</strong> format
            </GText>
          </li>
          <li>
            <GText variant="p-base" as="span">
              Resized longest edge to <strong>1280px</strong> (aspect ratio preserved)
            </GText>
          </li>
          <li>
            <GText variant="p-base" as="span">
              Compressed with <strong>80% quality</strong> settings
            </GText>
          </li>
        </ul>

        <div className="download-actions">
          <GFillButton
            onClick={() => { window.location.href = downloadUrl; }}
            className="download-btn"
          >
            <DownloadIcon size={18} style={{ marginRight: '8px' }} />
            Download WebP
          </GFillButton>

          <GStrokeButton onClick={onReset} className="reset-btn">
            Optimize Another Image
          </GStrokeButton>
        </div>
      </div>
    </GCard>
  );
};

export default DownloadSection;
