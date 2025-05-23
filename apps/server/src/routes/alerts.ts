import { Hono } from "hono";
import { HonoApp } from "@/types";
import { alertsApp } from "@/controllers/alerts";

export const alertsRouter = new Hono<HonoApp>();

alertsRouter.route("/", alertsApp);
