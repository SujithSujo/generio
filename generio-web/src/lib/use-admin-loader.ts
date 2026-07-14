"use client";

import { useEffect } from "react";

/** Fetch admin data from an effect using promise callbacks (lint-safe). */
export function useAdminFetch<T>(
  enabled: boolean,
  fetcher: () => Promise<T>,
  onSuccess: (data: T) => void,
  onError: (message: string) => void,
  errorMessage: string,
  deps: unknown[],
) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (!cancelled) onSuccess(data);
      })
      .catch(() => {
        if (!cancelled) onError(errorMessage);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit deps from caller
  }, deps);
}
