import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';

export function useApi(fetcher, { auto = true, deps = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(...args);
        setData(result);
        return result;
      } catch (e) {
        setError(e instanceof ApiError ? e : new ApiError('Server temporarily unavailable.', 'SERVER_ERROR'));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [fetcher]
  );

  useEffect(() => {
    if (auto) {
      run().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, run, setData };
}

export { api };
