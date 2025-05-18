import { auth } from "@/lib/auth";

export interface HonoApp {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}
