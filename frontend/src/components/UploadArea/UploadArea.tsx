import React, { useState, useRef } from 'react';
import { GFillButton, GText } from '../Gamut';
import { UploadIcon } from '@codecademy/gamut-icons';

interface UploadAreaProps {
  onUpload: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, onError, disabled }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndUpload = (file: File) => {
    // Validate size: 20MB limit
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      onError('File size exceeds the limit of 20 MB.');
      return;
    }

    // Validate type: images only
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      onError('Invalid file format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${disabled ? 'upload-disabled' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="file-input-hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <div className="upload-content">
        <UploadIcon size={48} className="upload-icon" />
        <GText variant="title-md" as="h3" className="upload-title">
          Drag & Drop Image Here
        </GText>
        <GText variant="p-small" as="p" className="upload-subtitle">
          Supports JPEG, PNG, WebP (Max 20MB)
        </GText>
        <GText variant="p-small" as="span" className="upload-or">
          or
        </GText>
        <GFillButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); triggerFileInput(); }} disabled={disabled}>
          Browse File
        </GFillButton>
      </div>
    </div>
  );
};

export default UploadArea;
