"use client";

import { useEffect } from "react";

/** Fetch admin data from an effect using promise callbacks (lint-safe). */
export function useAdminFetch<T>(
  enabled: boolean,
  fetcher: () => Promise<T>,
  onSuccess: (data: T) => void,
  onError: (message: string) => void,
  fallbackError: string,
  deps: unknown[],
) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (!cancelled) onSuccess(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const detail =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "";
          onError(detail && detail.length < 400 ? detail : fallbackError);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit deps from caller
  }, deps);
}
