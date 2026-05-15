import { addCrmEstimate, approveCrmEstimate, crmSnapshot } from "../../../../lib/server-crm-store";
import type { EstimateInput } from "../../../../lib/crm-engine";

export async function GET() {
  return Response.json({ estimates: crmSnapshot().estimates });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EstimateInput>;
    if (!body.jobId || !Array.isArray(body.lineItems) || body.lineItems.length === 0) {
      return Response.json({ error: "jobId and at least one line item are required" }, { status: 400 });
    }
    const estimate = addCrmEstimate(body as EstimateInput);
    return Response.json({ estimate, state: crmSnapshot() }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to create estimate" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { estimateId?: string };
    if (!body.estimateId) {
      return Response.json({ error: "estimateId is required" }, { status: 400 });
    }
    const estimate = approveCrmEstimate(body.estimateId);
    return Response.json({ estimate, state: crmSnapshot() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to approve estimate" }, { status: 400 });
  }
}
