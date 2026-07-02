import React, { useState } from 'react';
import { UploadArea } from '../components/UploadArea/UploadArea';
import { JobStatus } from '../components/JobStatus/JobStatus';
import { DownloadSection } from '../components/DownloadSection/DownloadSection';
import { ErrorAlert } from '../components/ErrorAlert/ErrorAlert';
import { useUploadImage } from '../hooks/useUploadImage';
import { useJobPolling } from '../hooks/useJobPolling';
import { GStrokeButton, GText, GCard, GSpinner } from '../components/Gamut';

export const Home: React.FC = () => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const uploadMutation = useUploadImage();
  const pollingQuery = useJobPolling(activeJobId);

  const handleUpload = (file: File) => {
    setErrorMsg(null);
    setOriginalName(file.name);

    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        setActiveJobId(data.jobId);
      },
      onError: (err: Error) => {
        setErrorMsg(err.message || 'Failed to upload image. Please try again.');
        setOriginalName(null);
      },
    });
  };

  const handleReset = () => {
    setActiveJobId(null);
    setOriginalName(null);
    setErrorMsg(null);
  };

  const isUploading = uploadMutation.isPending;

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-logo-container">
          <GText variant="title-xxl" as="h1" className="home-title">
            重ね Kasane
          </GText>
          <GText variant="p-small" as="p" className="home-subtitle">
            Layered Asynchronous Image Processing System
          </GText>
        </div>
      </header>

      <main className="home-main">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}

        {isUploading && (
          <GCard className="uploading-state-card" style={{ padding: '40px', textAlign: 'center' }}>
            <GSpinner />
            <GText variant="p-base" as="p" className="uploading-state-text" style={{ marginTop: '20px' }}>
              Uploading original image to storage...
            </GText>
          </GCard>
        )}

        {!activeJobId && !isUploading && (
          <UploadArea
            onUpload={handleUpload}
            onError={(msg) => setErrorMsg(msg)}
            disabled={isUploading}
          />
        )}

        {activeJobId && !isUploading && (
          <div className="processing-section" style={{ width: '100%' }}>
            {pollingQuery.isLoading && (
              <GCard className="loading-state-card" style={{ padding: '40px', textAlign: 'center' }}>
                <GSpinner />
                <GText variant="p-base" as="p" className="loading-state-text" style={{ marginTop: '20px' }}>
                  Fetching initial job status...
                </GText>
              </GCard>
            )}

            {pollingQuery.isError && (
              <GCard className="error-state-card" style={{ padding: '32px', textAlign: 'center' }}>
                <GText variant="title-md" as="h3" className="error-state-title" style={{ color: 'var(--status-failed-color)', marginBottom: '8px' }}>
                  Connection Error
                </GText>
                <GText variant="p-base" as="p" className="error-state-text">
                  {pollingQuery.error.message || 'Failed to connect to server.'}
                </GText>
                <GStrokeButton onClick={handleReset} style={{ marginTop: '16px' }}>
                  Back to Upload
                </GStrokeButton>
              </GCard>
            )}

            {pollingQuery.data && (
              <>
                {(pollingQuery.data.status === 'pending' ||
                  pollingQuery.data.status === 'processing') && (
                  <JobStatus
                    jobId={activeJobId}
                    status={pollingQuery.data.status}
                    originalName={originalName || pollingQuery.data.originalName}
                    error={pollingQuery.data.error}
                    refetchInterval={pollingQuery.refetchInterval}
                  />
                )}

                {pollingQuery.data.status === 'completed' && (
                  <DownloadSection
                    jobId={activeJobId}
                    originalName={originalName || pollingQuery.data.originalName}
                    onReset={handleReset}
                  />
                )}

                {pollingQuery.data.status === 'failed' && (
                  <div className="failed-container">
                    <JobStatus
                      jobId={activeJobId}
                      status={pollingQuery.data.status}
                      originalName={originalName || pollingQuery.data.originalName}
                      error={pollingQuery.data.error}
                      refetchInterval={pollingQuery.refetchInterval}
                    />
                    <GStrokeButton onClick={handleReset} style={{ marginTop: '20px', width: '100%' }}>
                      Back to Upload
                    </GStrokeButton>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer className="home-footer" />
    </div>
  );
};

export default Home;
