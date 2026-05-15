import Link from "next/link";
import { getReadinessReport } from "@/lib/production-readiness";

export default function SetupPage() {
  const report = getReadinessReport();
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-black text-emerald-300">← Back to dashboard</Link>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">Launch readiness</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          HomeFlow runs in no-secret demo mode today. For a real customer launch, add the keys below in Vercel or your host, then run npm run verify.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-slate-300">Mode</p>
            <p className="mt-2 text-3xl font-black capitalize">{report.mode}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-slate-300">Demo ready</p>
            <p className="mt-2 text-3xl font-black">{report.readyForDemo ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-slate-300">Production ready</p>
            <p className="mt-2 text-3xl font-black">{report.readyForProduction ? "Yes" : "No"}</p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white p-6 text-slate-950">
          <h2 className="text-2xl font-black">Missing production keys</h2>
          <div className="mt-4 grid gap-3">
            {report.missing.length === 0 ? <p className="font-bold text-emerald-700">All required launch keys are configured.</p> : report.missing.map((item) => (
              <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-black">{item.key}</p>
                <p className="mt-1 text-sm text-slate-600">{item.category}: {item.reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6">
          <h2 className="text-2xl font-black">Ship checklist</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-6 text-slate-200">
            {report.launchChecklist.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </section>
      </div>
    </main>
  );
}
