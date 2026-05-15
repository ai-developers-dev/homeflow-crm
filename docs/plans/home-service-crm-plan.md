# Home Service CRM Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build an end-to-end SaaS CRM prototype for HVAC, plumbing, roofing, electrical, landscaping, and other home service teams.

**Architecture:** A Next.js App Router application ships a competitive marketing site, an inline demo, and a dedicated `/dashboard` CRM app in one codebase. The current implementation is production-shaped and operational in demo mode: it includes a typed domain model, a tested CRM workflow engine, seeded CRM data, Next.js API routes for the backend, a health API, and backend/provider integration notes for Convex and Clerk. Real Convex mutations and Clerk auth are intentionally isolated for follow-up once keys are available.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn-inspired component styling, future-ready Convex schema design, Clerk auth integration plan.

---

## Research summary

Competitors and patterns reviewed from current home-service CRM search results: ServiceTitan, Housecall Pro, Jobber, QuoteIQ, contractor/HVAC CRM review pages, and vertical CRM feature lists. Common baseline capabilities are scheduling/dispatch, customer/contact timeline, estimates, invoicing/payments, call tracking, SMS/email reminders, forms, pipeline management, technician routing, memberships, reviews, and reporting. Gaps/opportunities: smaller trade businesses need faster setup, unified call/SMS/job context, simpler pricebooks, seasonal maintenance workflows, AI call summaries, and office/field collaboration that is less heavyweight than enterprise ServiceTitan.

## Product requirements

1. Marketing landing page that clearly positions the product for home service companies.
2. Auth-ready SaaS dashboard shell using Clerk-compatible assumptions: organization, owner/admin/dispatcher/technician roles, protected dashboard route in the future.
3. CRM entities: contacts, properties, jobs, estimates, calls, SMS conversations, technicians, tasks, pipeline stages, invoices, and maintenance plans.
4. Scheduling board with technician capacity, emergency priority, confirmed/unconfirmed status, and job lifecycle.
5. Communications center for inbound missed calls, callbacks, SMS reminders, templates, and call outcomes.
6. Contact management with service history, revenue, tags, next action, and source tracking.
7. Business operating dashboard: revenue, open estimates, booked jobs, response time, conversion, callbacks due.
8. Backend path: Convex schema and functions for contacts/jobs/messages/tasks; Clerk user/org ID mapped to tenant isolation.
9. Quality: TypeScript clean build, lint pass or known framework warnings only, health endpoint, manual QA checklist.

## Implementation tasks

### Task 1: Scaffold Next.js app
- Create a TypeScript App Router project with Tailwind.
- Verify `npm run build` reaches route type generation.

### Task 2: Define domain model and seed data
- Create `src/lib/crm-data.ts` with typed contacts, jobs, conversations, technicians, tasks, competitor insights, and metrics.
- Keep data deterministic so the dashboard is testable.

### Task 3: Build marketing landing page
- Replace the starter `src/app/page.tsx` with a complete SaaS marketing page: hero, ICPs, competitor-informed feature grid, CRM modules, proof metrics, pricing, implementation checklist, and CTA.
- Use shadcn-like cards, badges, buttons, and tables via Tailwind classes.

### Task 4: Build dashboard workflow simulation
- Add interactive state to create a contact, schedule a job, log a call, send an SMS template, and mark tasks complete.
- Keep everything local/demo-mode but typed and visibly operational.

### Task 4.5: Add real demo backend and tests
- Add `src/lib/crm-engine.ts` with tested contact, scheduling, call/SMS, task, and owner-summary business logic.
- Add Next.js API routes under `/api/crm` for snapshot, lead capture, job scheduling, communications, task completion, and demo reset.
- Add `/dashboard` as the full CRM app that calls these API routes instead of only mutating page-local state.

### Task 5: Add backend/provider readiness
- Add `/api/health` returning app status, modules, and timestamp.
- Add `convex/schema.ts` documenting production-ready tables for Convex tenant-isolated data.
- Add `.env.example` for Clerk/Convex/Twilio/Stripe placeholders.

### Task 6: Document verification and next steps
- Add `README.md` with setup, commands, architecture, deployment steps, and production hardening checklist.
- Run `npm run lint` and `npm run build`.
- Fix all compile/lint errors.

## Acceptance criteria

- `npm run build` completes successfully.
- `npm run lint` completes successfully.
- `npm run test` completes successfully and covers the CRM workflow engine.
- Landing page, inline demo, and `/dashboard` CRM app are usable without secrets.
- Health endpoint and `/api/crm/*` routes compile and respond in production start mode.
- Convex/Clerk integration points are documented without breaking local demo mode.
- Handoff includes exact changed files and verification commands.
