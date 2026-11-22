import { useEffect, useState } from "react";
import { fetchJson } from "./api";

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

    fetchJson<T>(url, controller.signal)
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
                ? `Could not load ${resourceName}: ${requestError.message}`
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
