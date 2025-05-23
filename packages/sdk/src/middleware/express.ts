import { LLMonitorClient } from "../client";
import { LLMonitorConfig } from "../types";

export interface ExpressRequest {
  method: string;
  path: string;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  query?: Record<string, any>;
  params?: Record<string, any>;
}

export interface ExpressResponse {
  statusCode: number;
  send: (body: any) => void;
}

export interface ExpressNextFunction {
  (): void;
}

export type Request = ExpressRequest;
export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;

export interface ExpressMiddlewareOptions extends Partial<LLMonitorConfig> {
  skipPaths?: string[];
  extractSessionId?: (req: Request) => string | undefined;
  extractMetadata?: (req: Request) => Record<string, any>;
}

export function createExpressMiddleware(
  options: ExpressMiddlewareOptions = {}
) {
  const client = new LLMonitorClient({
    apiKey: options.apiKey || process.env.LLMONITOR_API_KEY || "",
    baseURL: options.baseURL,
    debug: options.debug,
    enabled: options.enabled,
    sessionId: options.sessionId,
    versionTag: options.versionTag,
    metadata: options.metadata,
  });

  return (req: Request, res: Response, next: NextFunction) => {
    if (options.skipPaths?.some((path) => req.path.includes(path))) {
      return next();
    }

    const sessionId = options.extractSessionId?.(req) || options.sessionId;
    const metadata = {
      ...options.metadata,
      ...options.extractMetadata?.(req),
      method: req.method,
      path: req.path,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    };

    (req as any).llmonitor = {
      client,
      sessionId,
      metadata,
      startTime: Date.now(),
    };

    const originalSend = res.send;
    res.send = function (body: any) {
      const endTime = Date.now();
      const latency = endTime - (req as any).llmonitor.startTime;

      if (res.statusCode >= 400) {
        client
          .logEvent({
            provider: "express",
            model: "middleware",
            prompt: `${req.method} ${req.path}`,
            completion: body ? JSON.stringify(body).slice(0, 1000) : "",
            status: res.statusCode,
            latency_ms: latency,
            session_id: sessionId,
            metadata: {
              ...metadata,
              statusCode: res.statusCode,
              responseSize: body ? JSON.stringify(body).length : 0,
            },
          })
          .catch((err) => {
            if (client.config?.debug) {
              console.warn("[LLMonitor] Failed to log Express event:", err);
            }
          });
      }

      return originalSend.call(this, body);
    };

    next();
  };
}

export class ExpressLLMonitor {
  private client: LLMonitorClient;

  constructor(config: LLMonitorConfig) {
    this.client = new LLMonitorClient(config);
  }

  middleware(
    options: Omit<ExpressMiddlewareOptions, keyof LLMonitorConfig> = {}
  ) {
    return createExpressMiddleware({
      ...this.client.config,
      ...options,
    });
  }

  async logRequest(
    req: Request,
    res: Response,
    metadata?: Record<string, any>
  ): Promise<void> {
    const llmonitorData = (req as any).llmonitor;

    return this.client.logEvent({
      provider: "express",
      model: "request",
      prompt: `${req.method} ${req.path}`,
      completion: res.statusCode.toString(),
      status: res.statusCode,
      latency_ms: llmonitorData
        ? Date.now() - llmonitorData.startTime
        : undefined,
      session_id: llmonitorData?.sessionId,
      metadata: {
        ...llmonitorData?.metadata,
        ...metadata,
        body: req.body,
        query: req.query,
        params: req.params,
      },
    });
  }
}
