import { authMiddleware, subscriptionMiddleware } from "@/middleware/auth";
import { HonoApp } from "@/types";
import { Context, Hono, MiddlewareHandler } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

// Generic middleware type that can handle different error codes
type GenericMiddleware = (
  c: Context,
  next: () => Promise<void>
) => Promise<void | Response>;

export enum SORT_ORDER {
  ASC = "asc",
  DESC = "desc",
}

interface EndpointBuilderParams {
  path: string;
  method: HttpMethod;
  body: (c: Context) => Promise<Response>;
  isPrivate: boolean;
  requiresSubscription?: boolean; // Subscription required (includes trial)
  roles?: string[];
  errorMessage?: string;
  errorStatus?: number;
  middlewares?: MiddlewareHandler<HonoApp>[];
}

export const endpointBuilder = ({
  path,
  method,
  body,
  isPrivate,
  requiresSubscription = false,
  roles,
  errorMessage = "Internal server error",
  errorStatus = 500,
  middlewares = [],
}: EndpointBuilderParams) => {
  return (app: Hono<HonoApp>) => {
    const handler = async (c: Context) => {
      try {
        return await body(c);
      } catch (error) {
        console.error(`[-]: Error in ${path}`, error);
        return c.json(
          { error: errorMessage },
          errorStatus as ContentfulStatusCode
        );
      }
    };

    const methodLower = method.toLowerCase() as Lowercase<HttpMethod>;

    if (isPrivate) {
      // Build middleware chain for private endpoints
      const authMiddlewares: GenericMiddleware[] = [
        authMiddleware as GenericMiddleware,
      ];

      // Add subscription middleware if required
      if (requiresSubscription) {
        authMiddlewares.push(subscriptionMiddleware as GenericMiddleware);
      }

      // Add any additional middlewares
      const allMiddlewares = [...authMiddlewares, ...middlewares];
      (app as any)[methodLower](path, ...allMiddlewares, handler);
    } else if (middlewares.length > 0) {
      // Only add specified middlewares for public endpoints
      (app as any)[methodLower](path, ...middlewares, handler);
    } else {
      // No middlewares for public endpoints
      (app as any)[methodLower](path, handler);
    }

    return app;
  };
};
