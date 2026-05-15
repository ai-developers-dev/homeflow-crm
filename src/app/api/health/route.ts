import { NextResponse } from "next/server";
import { getReadinessReport } from "../../../lib/production-readiness";

export function GET() {
  const readiness = getReadinessReport();
  return NextResponse.json({
    ok: true,
    app: "HomeFlow CRM",
    mode: readiness.mode,
    readyForDemo: readiness.readyForDemo,
    readyForProduction: readiness.readyForProduction,
    modules: ["marketing", "dashboard", "contacts", "scheduling", "communications", "tasks", "estimates", "invoices", "payments", "readiness", "convex-schema"],
    timestamp: new Date().toISOString(),
  });
}
