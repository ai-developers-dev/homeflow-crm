# HomeFlow CRM

HomeFlow CRM is a full-stack-shaped SaaS prototype for home service businesses: HVAC, plumbing, roofing, electrical, landscaping, restoration, appliance repair, and general contracting.

It includes:

- A Next.js marketing landing page for conversion.
- An operational dashboard prototype with contact management, scheduling, calls, SMS, tasks, and revenue metrics.
- A dedicated `/dashboard` CRM app backed by Next.js API routes for contacts, jobs, calls/SMS, tasks, technician capacity, and owner reporting.
- A typed CRM domain model with deterministic sample data.
- A health API route.
- Convex schema draft for the production backend.
- Clerk/Convex/Twilio/Stripe environment placeholders.

## Run locally

```bash
cd /opt/data/kanban/workspaces/t_a32ac2df/homeflow-crm
npm install
npm run dev
```

Open http://localhost:3000 for the marketing site.
Open http://localhost:3000/dashboard for the full CRM application.

## Operational API

The demo backend uses Next.js API routes with an in-memory CRM store, so it works immediately without secrets:

- `GET /api/crm` returns contacts, jobs, messages, tasks, technicians, and owner summary metrics.
- `POST /api/crm/contacts` captures a lead and creates a qualification task.
- `POST /api/crm/jobs` schedules a job and creates a dispatch task.
- `POST /api/crm/messages` logs inbound calls or queues outbound SMS.
- `PATCH /api/crm/tasks` completes tasks.
- `DELETE /api/crm` resets demo data.

## Verify

```bash
npm run lint
npm run test
npm run build
```

## Architecture

Current mode is demo-first and fully operational without credentials. The dashboard actions update local React state so reviewers can test product workflows immediately.

Production path:

1. Clerk protects `/dashboard` routes and provides `userId` and `orgId`.
2. Convex stores tenant-isolated CRM data keyed by Clerk organization ID.
3. Twilio powers calls, SMS, recordings, missed-call alerts, reminders, and call summaries.
4. Stripe handles payments, deposits, maintenance plans, and invoices.
5. Technician mobile PWA handles route views, job notes, photos, checklist completion, and customer signatures.

## Competitive positioning

The product targets contractors who need the operating power of ServiceTitan/Housecall Pro/Jobber but want faster setup, less overhead, and a unified office + field workflow. The prototype emphasizes:

- Speed-to-lead after calls and form fills.
- Unified contact timeline across calls, SMS, estimates, and jobs.
- Dispatch board with technician capacity and emergency priority.
- Maintenance-plan and callback workflows that produce recurring revenue.
- Clean reporting for owners: response time, conversion, booked revenue, and open estimates.

## Production hardening checklist

- Replace demo state with Convex queries/mutations.
- Add Clerk middleware and org role checks.
- Add Twilio webhooks for inbound calls/SMS and consent-compliant outbound messaging.
- Add Stripe invoices, subscriptions, and deposits.
- Add background jobs for reminders, review requests, and stale estimate follow-ups.
- Add audit logs, RBAC, tenant isolation tests, and SOC2-ready logging.
- Add E2E tests for lead capture, schedule job, send SMS, close estimate, and invoice payment.
