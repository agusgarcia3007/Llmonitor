import React, { createContext, useContext, useMemo, useState } from "react";
import { LLMonitor } from "@llmonitor/sdk";
import { LLMonitorContextValue, LLMonitorProviderProps } from "./types";

const LLMonitorContext = createContext<LLMonitorContextValue | null>(null);

export function LLMonitorProvider({
  config,
  children,
}: LLMonitorProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionIdState] = useState<string | undefined>(
    config.sessionId
  );

  const monitor = useMemo(
    () =>
      new LLMonitor({
        ...config,
        sessionId,
      }),
    [config, sessionId]
  );

  const setSessionId = (newSessionId: string) => {
    setSessionIdState(newSessionId);
    monitor.updateConfig({ sessionId: newSessionId });
  };

  const track = async <T,>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    setIsLoading(true);
    const startTime = Date.now();
    let result: T;
    let error: Error | null = null;

    try {
      result = await operation();
      return result;
    } catch (err) {
      error = err as Error;
      throw err;
    } finally {
      const endTime = Date.now();
      const latency = endTime - startTime;

      try {
        await monitor.logEvent({
          provider: "react",
          model: operationName,
          prompt: `Operation: ${operationName}`,
          completion: error ? `Error: ${error.message}` : "Success",
          status: error ? 500 : 200,
          latency_ms: latency,
          metadata: {
            ...metadata,
            operationName,
            error: error?.message,
          },
        });
      } catch (logError) {
        console.warn("[LLMonitor] Failed to log React operation:", logError);
      }

      setIsLoading(false);
    }
  };

  const logEvent = async (event: any) => {
    return monitor.logEvent({
      provider: "react",
      model: "manual",
      prompt: "",
      completion: "",
      status: 200,
      ...event,
    });
  };

  const value: LLMonitorContextValue = {
    monitor,
    track,
    logEvent,
    isLoading,
    sessionId,
    setSessionId,
  };

  return (
    <LLMonitorContext.Provider value={value}>
      {children}
    </LLMonitorContext.Provider>
  );
}

export function useLLMonitorContext(): LLMonitorContextValue {
  const context = useContext(LLMonitorContext);
  if (!context) {
    throw new Error(
      "useLLMonitorContext must be used within LLMonitorProvider"
    );
  }
  return context;
}
