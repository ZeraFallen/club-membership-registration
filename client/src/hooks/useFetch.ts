import { useCallback, useEffect, useState } from 'react';
import { isCancel } from 'axios';
import api, { getErrorMessage } from '../api/axios';

// Custom hook: loads data with GET and tracks loading and error state.
export function useFetch<T>(url: string, params: Record<string, string> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // `params` is a new object on every render, so compare it by value instead.
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<T>(url, {
          params: JSON.parse(paramsKey),
          signal: controller.signal,
        });
        setData(res.data);
      } catch (err) {
        if (isCancel(err)) return; // a newer request replaced this one
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();

    // Cleanup: cancel the request if the filters change or the page closes.
    return () => controller.abort();
  }, [url, paramsKey, reloadCount]);

  // Calling refetch() bumps the counter, which re-runs the effect above.
  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  return { data, setData, loading, error, refetch };
}
