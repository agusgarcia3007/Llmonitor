import { useLLMonitorContext } from "../provider";

export function useLLMonitor() {
  const context = useLLMonitorContext();

  return {
    monitor: context.monitor,
    track: context.track,
    logEvent: context.logEvent,
    isLoading: context.isLoading,
    sessionId: context.sessionId,
    setSessionId: context.setSessionId,
  };
}
