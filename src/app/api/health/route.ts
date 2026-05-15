import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "HomeFlow CRM",
    mode: "demo-operational",
    modules: ["marketing", "dashboard", "contacts", "scheduling", "communications", "tasks", "convex-schema-draft"],
    timestamp: new Date().toISOString(),
  });
}
