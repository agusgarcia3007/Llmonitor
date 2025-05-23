import { useState, useCallback } from "react";
import { useLLMonitor } from "./useLLMonitor";
import { TrackingOptions, TrackingState } from "../types";

export function useLLMTracking(defaultOptions?: TrackingOptions) {
  const { track, logEvent } = useLLMonitor();
  const [state, setState] = useState<TrackingState>({
    isLoading: false,
    error: null,
    lastEvent: null,
  });

  const trackOperation = useCallback(
    async <T>(
      operationName: string,
      operation: () => Promise<T>,
      options?: TrackingOptions
    ): Promise<T> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await track(operationName, operation, {
          ...defaultOptions,
          ...options,
        });

        setState((prev) => ({ ...prev, isLoading: false }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    [track, defaultOptions]
  );

  const logCustomEvent = useCallback(
    async (event: any) => {
      try {
        await logEvent(event);
        setState((prev) => ({ ...prev, lastEvent: event }));
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as Error }));
      }
    },
    [logEvent]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    trackOperation,
    logCustomEvent,
    clearError,
  };
}
