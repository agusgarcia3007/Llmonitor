import { getAlertSections, saveAlertSections } from "@/controllers/alerts";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

const alertsRouter = new Hono<HonoApp>();

endpointBuilder({
  path: "/sections",
  method: HttpMethod.GET,
  body: getAlertSections,
  isPrivate: true,
})(alertsRouter);

endpointBuilder({
  path: "/sections",
  method: HttpMethod.POST,
  body: saveAlertSections,
  isPrivate: true,
})(alertsRouter);

export { alertsRouter };
