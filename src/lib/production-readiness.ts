export type ReadinessCategory = "auth" | "database" | "communications" | "payments" | "app";

export type MissingReadinessKey = {
  key: string;
  category: ReadinessCategory;
  reason: string;
};

export type ReadinessReport = {
  mode: "demo" | "production";
  readyForDemo: boolean;
  readyForProduction: boolean;
  missing: MissingReadinessKey[];
  configured: Record<ReadinessCategory, boolean>;
  launchChecklist: string[];
};

const requiredKeys: MissingReadinessKey[] = [
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", category: "auth", reason: "Clerk publishable key for browser auth" },
  { key: "CLERK_SECRET_KEY", category: "auth", reason: "Clerk server key for protected API routes and org membership" },
  { key: "NEXT_PUBLIC_CONVEX_URL", category: "database", reason: "Convex client URL for tenant CRM persistence" },
  { key: "CONVEX_DEPLOYMENT", category: "database", reason: "Convex deployment name for deploy/codegen" },
  { key: "TWILIO_ACCOUNT_SID", category: "communications", reason: "Twilio account SID for calls and SMS" },
  { key: "TWILIO_AUTH_TOKEN", category: "communications", reason: "Twilio auth token for call/SMS API access" },
  { key: "TWILIO_PHONE_NUMBER", category: "communications", reason: "Twilio sending/calling number" },
  { key: "STRIPE_SECRET_KEY", category: "payments", reason: "Stripe secret key for checkout, deposits, and invoices" },
  { key: "STRIPE_WEBHOOK_SECRET", category: "payments", reason: "Stripe webhook signature verification" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", category: "payments", reason: "Stripe browser publishable key" },
  { key: "NEXT_PUBLIC_APP_URL", category: "app", reason: "Canonical app URL for webhooks and redirects" },
];

export function getReadinessReport(env: Record<string, string | undefined> = process.env): ReadinessReport {
  const missing = requiredKeys.filter((item) => !env[item.key]?.trim());
  const configured = {
    auth: !missing.some((item) => item.category === "auth"),
    database: !missing.some((item) => item.category === "database"),
    communications: !missing.some((item) => item.category === "communications"),
    payments: !missing.some((item) => item.category === "payments"),
    app: !missing.some((item) => item.category === "app"),
  } satisfies Record<ReadinessCategory, boolean>;
  const readyForProduction = missing.length === 0;

  return {
    mode: readyForProduction ? "production" : "demo",
    readyForDemo: true,
    readyForProduction,
    missing,
    configured,
    launchChecklist: [
      "Create Clerk application, enable organizations, add staff/customer roles, and configure redirect URLs.",
      "Create Convex deployment, run `npx convex dev`, then seed first tenant data.",
      "Buy/verify Twilio number, configure inbound voice/SMS webhooks, and complete A2P 10DLC for SMS compliance.",
      "Create Stripe products for deposits, invoices, and maintenance plans; configure webhook endpoint.",
      "Deploy on Vercel with the environment variables above and run `npm run verify` before DNS cutover.",
    ],
  };
}
