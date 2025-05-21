import { authMiddleware } from "@/middleware/auth";
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

export enum SORT_ORDER {
  ASC = "asc",
  DESC = "desc",
}

interface EndpointBuilderParams {
  path: string;
  method: HttpMethod;
  body: (c: Context) => Promise<Response>;
  isPrivate: boolean;
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
      // Add auth middleware by default for private endpoints
      const allMiddlewares = [authMiddleware, ...middlewares];
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
