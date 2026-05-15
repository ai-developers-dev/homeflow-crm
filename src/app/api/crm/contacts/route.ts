import { addCrmContact, crmSnapshot } from "../../../../lib/server-crm-store";
import type { LeadInput } from "../../../../lib/crm-engine";

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function GET() {
  return Response.json({ contacts: crmSnapshot().contacts });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LeadInput>;
  if (!body.name || !body.phone || !body.trade || !body.source || !body.address) {
    return badRequest("name, phone, trade, source, and address are required");
  }

  const contact = addCrmContact(body as LeadInput);
  return Response.json({ contact, state: crmSnapshot() }, { status: 201 });
}
