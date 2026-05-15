import { describe, expect, it } from "vitest";
import { getReadinessReport } from "./production-readiness";

describe("production readiness", () => {
  it("keeps demo mode operational while naming missing production keys", () => {
    const report = getReadinessReport({});

    expect(report.mode).toBe("demo");
    expect(report.readyForDemo).toBe(true);
    expect(report.readyForProduction).toBe(false);
    expect(report.missing.map((item) => item.key)).toContain("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
    expect(report.missing.map((item) => item.key)).toContain("NEXT_PUBLIC_CONVEX_URL");
    expect(report.missing.map((item) => item.key)).toContain("TWILIO_ACCOUNT_SID");
    expect(report.missing.map((item) => item.key)).toContain("STRIPE_SECRET_KEY");
  });

  it("reports production-ready only when required launch keys are present", () => {
    const report = getReadinessReport({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
      CLERK_SECRET_KEY: "sk_test_123",
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      CONVEX_DEPLOYMENT: "dev:example",
      TWILIO_ACCOUNT_SID: "AC123",
      TWILIO_AUTH_TOKEN: "twilio_secret",
      TWILIO_PHONE_NUMBER: "+15555550100",
      STRIPE_SECRET_KEY: "sk_test_stripe",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_stripe",
      NEXT_PUBLIC_APP_URL: "https://homeflow.example.com",
    });

    expect(report.mode).toBe("production");
    expect(report.readyForProduction).toBe(true);
    expect(report.missing).toEqual([]);
  });
});
