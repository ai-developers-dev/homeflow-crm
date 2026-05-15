import { crmSnapshot, markCrmTaskComplete } from "../../../../lib/server-crm-store";

export async function GET() {
  return Response.json({ tasks: crmSnapshot().tasks });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<{ taskId: string }>;
  if (!body.taskId) {
    return Response.json({ error: "taskId is required" }, { status: 400 });
  }

  const task = markCrmTaskComplete(body.taskId);
  return Response.json({ task, state: crmSnapshot() });
}
