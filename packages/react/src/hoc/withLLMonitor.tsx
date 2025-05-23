import React from "react";
import { useLLMonitor } from "../hooks/useLLMonitor";
import { LLMEvent } from "@llmonitor/sdk";

export interface WithLLMonitorProps {
  llmonitor: {
    logEvent: (event: LLMEvent) => Promise<void>;
    sessionId?: string;
    setSessionId: (sessionId: string) => void;
  };
}

export function withLLMonitor<P extends object>(
  Component: React.ComponentType<P & WithLLMonitorProps>
) {
  const WrappedComponent = (props: P) => {
    const llmonitor = useLLMonitor();

    return <Component {...props} llmonitor={llmonitor} />;
  };

  WrappedComponent.displayName = `withLLMonitor(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
