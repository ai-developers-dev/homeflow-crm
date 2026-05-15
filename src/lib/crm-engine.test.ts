import { describe, expect, it } from "vitest";
import {
  calculateOperatingSummary,
  completeTask,
  createContactFromLead,
  logInboundCall,
  scheduleJobForContact,
  seedDashboardState,
  sendSmsTemplate,
} from "./crm-engine";

describe("home service CRM engine", () => {
  it("creates a qualified contact with normalized tags and next action", () => {
    const state = seedDashboardState();
    const contact = createContactFromLead(state, {
      name: "  Jordan Miller  ",
      phone: "512-555-0199",
      trade: "HVAC",
      source: "Google Local Services",
      address: "901 Oak St",
    });

    expect(contact.name).toBe("Jordan Miller");
    expect(contact.tags).toEqual(["new lead", "needs qualification", "google local services"]);
    expect(state.contacts[0]).toMatchObject({ id: contact.id, nextAction: "Qualify and schedule estimate" });
  });

  it("schedules the best technician for an urgent trade-specific job", () => {
    const state = seedDashboardState();
    const contact = state.contacts.find((candidate) => candidate.trade === "Plumbing")!;
    const job = scheduleJobForContact(state, {
      contactId: contact.id,
      title: "Water heater leaking",
      priority: "Emergency",
      amount: 1295,
      scheduled: "Today",
      window: "Now",
    });

    expect(job.customer).toBe(contact.name);
    expect(job.technician).toBe("Sam Cho");
    expect(job.status).toBe("Scheduled");
    expect(state.tasks[0].title).toContain("Dispatch Sam Cho");
  });

  it("logs calls, queues callbacks, sends SMS, and completes tasks", () => {
    const state = seedDashboardState();
    const contact = state.contacts[0];

    const call = logInboundCall(state, { contactId: contact.id, note: "Needs replacement quote today" });
    const sms = sendSmsTemplate(state, { contactId: contact.id, template: "Your technician is on the way." });
    const task = completeTask(state, state.tasks[0].id);

    expect(call.outcome).toBe("Callback task created");
    expect(sms).toMatchObject({ channel: "SMS", direction: "Outbound", outcome: "Queued for delivery" });
    expect(task.completed).toBe(true);
  });

  it("summarizes operating health for owner reporting", () => {
    const summary = calculateOperatingSummary(seedDashboardState());

    expect(summary.openRevenue).toBeGreaterThan(40000);
    expect(summary.emergencyJobs).toBe(1);
    expect(summary.overdueTasks).toBeGreaterThanOrEqual(1);
    expect(summary.scheduleUtilization).toBeGreaterThan(0.5);
  });
});
