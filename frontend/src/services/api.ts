const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface JobResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalName: string;
  originalPath: string;
  processedPath: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function uploadImage(file: File): Promise<{ jobId: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<JobResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch job status for ${jobId}`);
  }

  return response.json();
}

export function getDownloadUrl(jobId: string): string {
  return `${API_BASE_URL}/jobs/${jobId}/download`;
}
