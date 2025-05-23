import { LLMonitorConfig, LLMEvent } from "@llmonitor/sdk";

export interface LLMonitorContextValue {
  monitor: any;
  track: <T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ) => Promise<T>;
  logEvent: (event: Partial<LLMEvent>) => Promise<void>;
  isLoading: boolean;
  sessionId?: string;
  setSessionId: (sessionId: string) => void;
}

export interface LLMonitorProviderProps {
  config: LLMonitorConfig;
  children: React.ReactNode;
}

export interface TrackingOptions {
  sessionId?: string;
  versionTag?: string;
  metadata?: Record<string, any>;
  autoLog?: boolean;
}

export interface TrackingState {
  isLoading: boolean;
  error: Error | null;
  lastEvent: LLMEvent | null;
}
