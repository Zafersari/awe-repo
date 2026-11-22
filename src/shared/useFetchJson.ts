import { useEffect, useState } from "react";

interface FetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useFetchJson<T>(
  url: string,
  resourceName: string,
  cancelOnCleanup = true,
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true });

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${resourceName} (${response.status}).`);
        }
        return (await response.json()) as T;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            data: null,
            error:
              requestError instanceof Error
                ? requestError.message
                : `Could not load ${resourceName}.`,
            loading: false,
          });
        }
      });

    return () => {
      if (cancelOnCleanup) controller.abort();
    };
  }, [url, resourceName, cancelOnCleanup]);

  return state;
}
