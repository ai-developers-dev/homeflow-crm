import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Production schema draft. Install Convex and run `npx convex dev` once a deployment exists.
// Every table includes tenantId, expected to be Clerk organization ID for strict multi-tenant isolation.

export default defineSchema({
  contacts: defineTable({
    tenantId: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.string(),
    trade: v.string(),
    source: v.string(),
    tags: v.array(v.string()),
    lifetimeValue: v.number(),
    nextAction: v.string(),
    lastContactedAt: v.number(),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_phone", ["tenantId", "phone"]),

  jobs: defineTable({
    tenantId: v.string(),
    contactId: v.id("contacts"),
    title: v.string(),
    trade: v.string(),
    status: v.union(v.literal("new"), v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("invoiced")),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("emergency")),
    scheduledStart: v.number(),
    scheduledEnd: v.number(),
    technicianId: v.optional(v.id("technicians")),
    estimateAmount: v.number(),
    notes: v.string(),
    createdAt: v.number(),
  }).index("by_tenant_status", ["tenantId", "status"]).index("by_schedule", ["tenantId", "scheduledStart"]),

  technicians: defineTable({
    tenantId: v.string(),
    name: v.string(),
    trade: v.string(),
    phone: v.string(),
    capacityHours: v.number(),
    serviceArea: v.string(),
    active: v.boolean(),
  }).index("by_tenant", ["tenantId"]),

  messages: defineTable({
    tenantId: v.string(),
    contactId: v.id("contacts"),
    channel: v.union(v.literal("call"), v.literal("sms"), v.literal("email")),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    body: v.string(),
    outcome: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_contact", ["tenantId", "contactId", "createdAt"]),

  tasks: defineTable({
    tenantId: v.string(),
    ownerId: v.string(),
    contactId: v.optional(v.id("contacts")),
    jobId: v.optional(v.id("jobs")),
    title: v.string(),
    dueAt: v.number(),
    completed: v.boolean(),
    createdAt: v.number(),
  }).index("by_owner_due", ["tenantId", "ownerId", "dueAt"]),
});
