import { describe, expect, it } from "vitest";
import {
  approveEstimate,
  createEstimateForJob,
  createInvoiceFromEstimate,
  recordPaymentForInvoice,
  seedDashboardState,
} from "./crm-engine";

describe("revenue workflow", () => {
  it("moves an estimate through approval, invoicing, payment, and customer value", () => {
    const state = seedDashboardState();
    const job = state.jobs.find((candidate) => candidate.status === "Scheduled")!;
    const contact = state.contacts.find((candidate) => candidate.id === job.contactId)!;
    const startingLifetimeValue = contact.lifetimeValue;

    const estimate = createEstimateForJob(state, {
      jobId: job.id,
      lineItems: [
        { description: "Equipment", quantity: 1, unitPrice: 8400 },
        { description: "Labor", quantity: 12, unitPrice: 175 },
      ],
      financingOffered: true,
      depositRequired: 1500,
    });

    expect(estimate.total).toBe(10500);
    expect(estimate.status).toBe("Sent");
    expect(state.tasks[0].title).toContain("Follow up estimate");

    const approved = approveEstimate(state, estimate.id);
    expect(approved.status).toBe("Approved");
    expect(job.status).toBe("Scheduled");

    const invoice = createInvoiceFromEstimate(state, estimate.id, "stripe_checkout_demo");
    expect(invoice.status).toBe("Open");
    expect(invoice.amountDue).toBe(10500);
    expect(job.status).toBe("Invoiced");

    const paid = recordPaymentForInvoice(state, invoice.id, 10500, "stripe_payment_demo");
    expect(paid.status).toBe("Paid");
    expect(job.status).toBe("Completed");
    expect(contact.lifetimeValue).toBe(startingLifetimeValue + 10500);
    expect(contact.nextAction).toBe("Ask for review and maintenance-plan enrollment");
  });
});
