import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobStatus } from '../services/api';

export function useJobPolling(jobId: string | null) {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);
  const [requestCount, setRequestCount] = useState(0);

  // Reset polling states when jobId changes
  useEffect(() => {
    if (jobId) {
      setRefetchInterval(2000);
      setRequestCount(0);
    } else {
      setRefetchInterval(false);
    }
  }, [jobId]);

  const query = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID provided');
      return getJobStatus(jobId);
    },
    enabled: !!jobId,
    refetchInterval: refetchInterval,
  });

  // Calculate polling interval and handle backoff
  useEffect(() => {
    if (!query.data) return;

    const { status } = query.data;

    if (status === 'completed' || status === 'failed') {
      // Stop polling immediately
      setRefetchInterval(false);
    } else {
      // If we are still polling, update request count
      if (query.isSuccess) {
        setRequestCount((c) => c + 1);
      }

      // Exponential backoff
      // Initial: 2000ms (2s)
      // After 3 requests: 4000ms (4s)
      // After 4 requests: 8000ms (8s)
      // After 5+ requests: 16000ms (16s) (capped to avoid excessive delays)
      if (requestCount >= 3) {
        const exponent = Math.min(requestCount - 2, 3);
        const nextInterval = 2000 * Math.pow(2, exponent);
        setRefetchInterval(nextInterval);
      } else {
        setRefetchInterval(2000);
      }
    }
  }, [query.data, query.isSuccess]);

  return {
    ...query,
    refetchInterval,
  };
}
