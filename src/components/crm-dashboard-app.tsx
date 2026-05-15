"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { smsTemplates, type Contact, type Job, type Message, type Task, type Technician, type Trade } from "@/lib/crm-data";
import type { OperatingSummary } from "@/lib/crm-engine";

type CrmSnapshot = {
  contacts: Contact[];
  jobs: Job[];
  messages: Message[];
  tasks: Task[];
  technicians: Technician[];
  summary: OperatingSummary;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const trades: Trade[] = ["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping", "Restoration"];

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export function CrmDashboardApp() {
  const [snapshot, setSnapshot] = useState<CrmSnapshot | null>(null);
  const [status, setStatus] = useState("Loading CRM backend...");
  const [lead, setLead] = useState({ name: "Jordan Miller", phone: "512-555-0199", trade: "HVAC" as Trade, source: "Google Local Services", address: "901 Oak St, Austin TX" });
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [smsTemplate, setSmsTemplate] = useState(smsTemplates[0]);

  useEffect(() => {
    let cancelled = false;
    jsonFetch<CrmSnapshot>("/api/crm")
      .then((data) => {
        if (cancelled) return;
        setSnapshot(data);
        setSelectedContactId((current) => current || data.contacts[0]?.id || "");
        setStatus("Synced with Next API backend");
      })
      .catch((error) => {
        if (!cancelled) setStatus(`Backend error: ${error instanceof Error ? error.message : String(error)}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedContact = useMemo(() => snapshot?.contacts.find((contact) => contact.id === selectedContactId) ?? snapshot?.contacts[0], [snapshot, selectedContactId]);

  async function createLead() {
    const result = await jsonFetch<{ state: CrmSnapshot }>("/api/crm/contacts", { method: "POST", body: JSON.stringify(lead) });
    setSnapshot(result.state);
    setSelectedContactId(result.state.contacts[0].id);
    setStatus("New lead captured, tagged, and queued for qualification");
  }

  async function scheduleJob(priority: Job["priority"] = "High") {
    if (!selectedContact) return;
    const result = await jsonFetch<{ state: CrmSnapshot }>("/api/crm/jobs", {
      method: "POST",
      body: JSON.stringify({ contactId: selectedContact.id, title: `${selectedContact.trade} diagnostic and estimate`, priority, amount: priority === "Emergency" ? 1295 : 475, scheduled: priority === "Emergency" ? "Today" : "Tomorrow", window: priority === "Emergency" ? "Now" : "10:00 AM - 12:00 PM" }),
    });
    setSnapshot(result.state);
    setStatus(`${priority} job scheduled and dispatch task created`);
  }

  async function logCall() {
    if (!selectedContact) return;
    const result = await jsonFetch<{ state: CrmSnapshot }>("/api/crm/messages", { method: "POST", body: JSON.stringify({ kind: "call", contactId: selectedContact.id, note: "Inbound call: customer wants price, ETA, and financing options." }) });
    setSnapshot(result.state);
    setStatus("Inbound call logged to customer timeline with callback task");
  }

  async function sendSms() {
    if (!selectedContact) return;
    const result = await jsonFetch<{ state: CrmSnapshot }>("/api/crm/messages", { method: "POST", body: JSON.stringify({ kind: "sms", contactId: selectedContact.id, template: smsTemplate }) });
    setSnapshot(result.state);
    setStatus("SMS queued in communications timeline");
  }

  async function completeTask(taskId: string) {
    const result = await jsonFetch<{ state: CrmSnapshot }>("/api/crm/tasks", { method: "PATCH", body: JSON.stringify({ taskId }) });
    setSnapshot(result.state);
    setStatus("Task marked complete");
  }

  async function resetDemo() {
    const result = await jsonFetch<{ state: CrmSnapshot }>("/api/crm", { method: "DELETE" });
    setSnapshot(result.state);
    setSelectedContactId(result.state.contacts[0]?.id ?? "");
    setStatus("Demo data reset");
  }

  if (!snapshot) {
    return <main className="min-h-screen bg-slate-950 p-8 text-white"><p>{status}</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-sm font-black text-emerald-700">← HomeFlow CRM marketing site</Link>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Home service operating dashboard</h1>
            <p className="mt-2 text-slate-600">Operational Next.js backend demo: contacts, jobs, calls, SMS, tasks, technician capacity, and owner reporting.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill tone="green">Backend API live</Pill>
            <Pill tone="blue">Clerk/Convex ready</Pill>
            <button onClick={resetDemo} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold">Reset demo</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">{status}</div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl bg-slate-950 p-5 text-white"><p className="text-sm text-white/60">Open revenue</p><p className="mt-2 text-3xl font-black">{currency.format(snapshot.summary.openRevenue)}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Contacts</p><p className="mt-2 text-3xl font-black">{snapshot.contacts.length}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Jobs</p><p className="mt-2 text-3xl font-black">{snapshot.jobs.length}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Emergency jobs</p><p className="mt-2 text-3xl font-black">{snapshot.summary.emergencyJobs}</p></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Utilization</p><p className="mt-2 text-3xl font-black">{Math.round(snapshot.summary.scheduleUtilization * 100)}%</p></div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.15fr]">
          <Card title="Lead capture + contact management" action={<Pill>{snapshot.contacts.length} records</Pill>}>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" value={lead.name} onChange={(event) => setLead({ ...lead, name: event.target.value })} aria-label="Lead name" />
              <input className="rounded-xl border border-slate-200 px-3 py-2" value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} aria-label="Lead phone" />
              <select className="rounded-xl border border-slate-200 px-3 py-2" value={lead.trade} onChange={(event) => setLead({ ...lead, trade: event.target.value as Trade })}>{trades.map((trade) => <option key={trade}>{trade}</option>)}</select>
              <input className="rounded-xl border border-slate-200 px-3 py-2" value={lead.source} onChange={(event) => setLead({ ...lead, source: event.target.value })} aria-label="Lead source" />
              <input className="rounded-xl border border-slate-200 px-3 py-2 md:col-span-2" value={lead.address} onChange={(event) => setLead({ ...lead, address: event.target.value })} aria-label="Lead address" />
              <button onClick={createLead} className="rounded-xl bg-emerald-700 px-4 py-3 font-black text-white md:col-span-2">Capture lead</button>
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.contacts.map((contact) => (
                <button key={contact.id} onClick={() => setSelectedContactId(contact.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedContact?.id === contact.id ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex flex-wrap items-center gap-2"><strong>{contact.name}</strong><Pill>{contact.trade}</Pill>{contact.tags.slice(0, 2).map((tag) => <Pill key={tag} tone="amber">{tag}</Pill>)}</div>
                  <p className="mt-1 text-sm text-slate-600">{contact.phone} · {contact.address}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Next: {contact.nextAction}</p>
                </button>
              ))}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card title="Dispatch actions" action={selectedContact ? <Pill tone="green">Selected: {selectedContact.name}</Pill> : null}>
              <div className="grid gap-3 md:grid-cols-4">
                <button onClick={() => scheduleJob("High")} className="rounded-xl bg-slate-950 px-4 py-3 font-black text-white">Schedule job</button>
                <button onClick={() => scheduleJob("Emergency")} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white">Emergency dispatch</button>
                <button onClick={logCall} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-black">Log call</button>
                <button onClick={sendSms} className="rounded-xl bg-emerald-700 px-4 py-3 font-black text-white">Send SMS</button>
              </div>
              <select value={smsTemplate} onChange={(event) => setSmsTemplate(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2">{smsTemplates.map((template) => <option key={template}>{template}</option>)}</select>
              <div className="mt-4 grid gap-3">
                {snapshot.jobs.slice(0, 5).map((job) => <div key={job.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-2"><strong>{job.title}</strong><Pill tone={job.priority === "Emergency" ? "red" : "amber"}>{job.priority}</Pill><Pill tone="green">{job.status}</Pill></div><p className="mt-1 text-sm text-slate-600">{job.customer} · {job.scheduled}, {job.window} · {job.technician} · {currency.format(job.amount)}</p></div>)}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Communications timeline">
                <div className="space-y-3">{snapshot.messages.slice(0, 6).map((message) => <div key={message.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><strong>{message.contact}</strong><Pill tone={message.channel === "Call" ? "red" : message.channel === "SMS" ? "green" : "blue"}>{message.channel}</Pill></div><p className="mt-2 text-sm text-slate-600">{message.body}</p><p className="mt-2 text-xs font-bold text-slate-500">{message.time} · {message.outcome}</p></div>)}</div>
              </Card>
              <Card title="Task queue" action={<Pill tone="amber">{snapshot.summary.overdueTasks} hot</Pill>}>
                <div className="space-y-3">{snapshot.tasks.slice(0, 7).map((task) => <button key={task.id} onClick={() => completeTask(task.id)} className={`w-full rounded-2xl border p-4 text-left ${task.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-2"><strong>{task.title}</strong><Pill tone={task.completed ? "green" : "amber"}>{task.completed ? "Done" : task.due}</Pill></div><p className="mt-1 text-sm text-slate-600">{task.owner} · {task.impact}</p></button>)}</div>
              </Card>
            </div>
          </div>
        </div>

        <Card title="Technician capacity board" action={<Pill tone="blue">Route-ready field team</Pill>}>
          <div className="grid gap-4 md:grid-cols-4">{snapshot.technicians.map((tech) => <div key={tech.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><strong>{tech.name}</strong><span className="text-sm font-bold">⭐ {tech.rating}</span></div><p className="mt-1 text-sm text-slate-600">{tech.trade} · {tech.area}</p><div className="mt-3 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.round((tech.booked / tech.capacity) * 100)}%` }} /></div><p className="mt-1 text-xs font-bold text-slate-500">{tech.booked}/{tech.capacity} hours booked</p></div>)}</div>
        </Card>
      </div>
    </main>
  );
}
