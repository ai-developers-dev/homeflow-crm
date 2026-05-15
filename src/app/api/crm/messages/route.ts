import { addCrmCall, addCrmSms, crmSnapshot } from "../../../../lib/server-crm-store";
import type { CallInput, SmsInput } from "../../../../lib/crm-engine";

export async function GET() {
  return Response.json({ messages: crmSnapshot().messages });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SmsInput & CallInput & { kind: "sms" | "call" }>;
  if (!body.contactId) {
    return Response.json({ error: "contactId is required" }, { status: 400 });
  }

  if (body.kind === "call") {
    if (!body.note) return Response.json({ error: "note is required for calls" }, { status: 400 });
    const message = addCrmCall({ contactId: body.contactId, note: body.note });
    return Response.json({ message, state: crmSnapshot() }, { status: 201 });
  }

  if (!body.template) return Response.json({ error: "template is required for SMS" }, { status: 400 });
  const message = addCrmSms({ contactId: body.contactId, template: body.template });
  return Response.json({ message, state: crmSnapshot() }, { status: 201 });
}
