import { crmSnapshot, resetCrmState } from "../../../lib/server-crm-store";

export async function GET() {
  return Response.json(crmSnapshot());
}

export async function DELETE() {
  return Response.json({ ok: true, state: resetCrmState() });
}
