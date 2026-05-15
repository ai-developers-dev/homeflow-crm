import { addCrmJob, crmSnapshot } from "../../../../lib/server-crm-store";
import type { JobInput } from "../../../../lib/crm-engine";

export async function GET() {
  return Response.json({ jobs: crmSnapshot().jobs });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<JobInput>;
  if (!body.contactId || !body.title || !body.priority || typeof body.amount !== "number" || !body.scheduled || !body.window) {
    return Response.json({ error: "contactId, title, priority, amount, scheduled, and window are required" }, { status: 400 });
  }

  const job = addCrmJob(body as JobInput);
  return Response.json({ job, state: crmSnapshot() }, { status: 201 });
}
