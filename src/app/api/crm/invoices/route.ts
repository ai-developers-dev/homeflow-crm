import { addCrmInvoice, addCrmPayment, crmSnapshot } from "../../../../lib/server-crm-store";

export async function GET() {
  return Response.json({ invoices: crmSnapshot().invoices });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { estimateId?: string; checkoutRef?: string };
    if (!body.estimateId) {
      return Response.json({ error: "estimateId is required" }, { status: 400 });
    }
    const invoice = addCrmInvoice(body.estimateId, body.checkoutRef ?? "stripe_checkout_demo");
    return Response.json({ invoice, state: crmSnapshot() }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to create invoice" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { invoiceId?: string; amount?: number; providerRef?: string };
    if (!body.invoiceId || typeof body.amount !== "number") {
      return Response.json({ error: "invoiceId and numeric amount are required" }, { status: 400 });
    }
    const invoice = addCrmPayment(body.invoiceId, body.amount, body.providerRef ?? "stripe_payment_demo");
    return Response.json({ invoice, state: crmSnapshot() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to record payment" }, { status: 400 });
  }
}
