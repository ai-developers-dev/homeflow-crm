# HomeFlow CRM

HomeFlow CRM is a home-services SaaS CRM for HVAC, plumbing, roofing, electrical, landscaping, restoration, appliance repair, and general contractors.

It now includes a working demo app plus production launch scaffolding:

- Next.js marketing landing page at `/`.
- Operational CRM dashboard at `/dashboard`.
- Launch readiness page at `/setup`.
- API backend routes for contacts, jobs, calls, SMS, tasks, estimates, invoices, payments, health, and readiness.
- Tested CRM workflow engine covering lead capture, dispatch, communications, revenue workflow, and production readiness.
- Convex schema for tenant-isolated production data.
- Clerk/Convex/Twilio/Stripe environment placeholders and readiness checks.
- Security headers, standalone Docker build, and GitHub Actions verification workflow.

## Run locally

```bash
cd /opt/data/kanban/workspaces/t_a32ac2df/homeflow-crm
npm install
npm run dev
```

Open:

- http://localhost:3000 for the marketing site
- http://localhost:3000/dashboard for the CRM app
- http://localhost:3000/setup for production key/readiness checklist

## Verify before shipping

```bash
npm run lint
npm run test
npm run build
npm run audit:high
```

Or run everything:

```bash
npm run verify
```

## Operational API

The current backend runs without secrets using an in-memory demo store:

- `GET /api/health` returns service status and enabled modules.
- `GET /api/readiness` returns missing production keys and launch checklist.
- `GET /api/crm` returns contacts, jobs, messages, tasks, technicians, estimates, invoices, and owner metrics.
- `DELETE /api/crm` resets demo data.
- `POST /api/crm/contacts` captures a lead and creates a qualification task.
- `POST /api/crm/jobs` schedules a job and creates a dispatch task.
- `POST /api/crm/messages` logs inbound calls or queues outbound SMS.
- `PATCH /api/crm/tasks` completes tasks.
- `POST /api/crm/estimates` creates and sends an estimate.
- `PATCH /api/crm/estimates` approves an estimate.
- `POST /api/crm/invoices` creates a Stripe-ready invoice from an approved estimate.
- `PATCH /api/crm/invoices` records payment, closes the job, updates customer LTV, and creates review/maintenance follow-up.

## Production keys needed

The app runs in demo mode until these are configured:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=
```

## Production launch path

1. Clerk: create application, enable organizations, add admin/dispatcher/technician roles, configure redirect URLs.
2. Convex: create deployment, run `npx convex dev`, deploy schema, seed the first tenant, and replace demo API handlers with Convex queries/mutations.
3. Twilio: buy/verify number, configure inbound voice/SMS webhooks, complete A2P 10DLC for compliant business SMS.
4. Stripe: create invoice/deposit/maintenance-plan products, configure webhooks, and connect invoice payments to `/api/crm/invoices` replacement handlers.
5. Deploy on Vercel or Docker, set all env vars, run `npm run verify`, smoke test `/api/health`, `/api/readiness`, `/dashboard`, and `/setup`.

## Docker

```bash
docker build -t homeflow-crm .
docker run --rm -p 3000:3000 homeflow-crm
```

## Competitive positioning

HomeFlow targets contractors who need the operating power of ServiceTitan/Housecall Pro/Jobber but want faster setup, less overhead, and a unified office + field workflow.

Differentiators in this build:

- Speed-to-lead after calls and form fills.
- Unified contact timeline across calls, SMS, estimates, invoices, jobs, and payments.
- Dispatch board with technician capacity and emergency priority.
- Estimate → invoice → payment workflow with maintenance-plan/review follow-up.
- Owner reporting for response time, booked/open revenue, utilization, and overdue work.
- Clear production-readiness gate for real credentials instead of pretending demo mode is production.
