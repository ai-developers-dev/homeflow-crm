"use client";

import { useMemo, useState } from "react";
import {
  competitors,
  contacts as seedContacts,
  jobs as seedJobs,
  messages as seedMessages,
  metrics,
  smsTemplates,
  tasks as seedTasks,
  technicians,
  type Contact,
  type Job,
  type Message,
  type Task,
  type Trade,
} from "@/lib/crm-data";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const modules = [
  "Lead inbox",
  "Call tracking",
  "2-way SMS",
  "Contact timeline",
  "Dispatch board",
  "Technician capacity",
  "Estimate follow-up",
  "Payments readiness",
  "Maintenance plans",
  "Owner reporting",
];

const trades: Trade[] = ["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping", "Restoration"];

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "slate" | "red" }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">{text}</p>
    </div>
  );
}

function MetricCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-emerald-700">{delta}</p>
    </div>
  );
}

function ContactForm({ onAdd }: { onAdd: (contact: Contact) => void }) {
  const [name, setName] = useState("Jordan Miller");
  const [phone, setPhone] = useState("(512) 555-0199");
  const [trade, setTrade] = useState<Trade>("HVAC");

  return (
    <form
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd({
          id: `c${Date.now()}`,
          name,
          trade,
          phone,
          email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
          address: "New lead address pending",
          source: "Landing page demo",
          tags: ["new lead", "needs qualification"],
          lifetimeValue: 0,
          nextAction: "Qualify and schedule estimate",
          lastContact: "Just now",
        });
      }}
    >
      <input className="rounded-xl border border-slate-200 px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} aria-label="Contact name" />
      <input className="rounded-xl border border-slate-200 px-3 py-2" value={phone} onChange={(event) => setPhone(event.target.value)} aria-label="Phone" />
      <select className="rounded-xl border border-slate-200 px-3 py-2" value={trade} onChange={(event) => setTrade(event.target.value as Trade)} aria-label="Trade">
        {trades.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <button className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white hover:bg-emerald-800" type="submit">
        Add contact
      </button>
    </form>
  );
}

function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>(seedContacts);
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [selectedTemplate, setSelectedTemplate] = useState(smsTemplates[0]);

  const openRevenue = useMemo(() => jobs.filter((job) => job.status !== "Completed" && job.status !== "Invoiced").reduce((sum, job) => sum + job.amount, 0), [jobs]);

  function schedulePriorityJob() {
    const firstContact = contacts[0];
    const newJob: Job = {
      id: `j${Date.now()}`,
      contactId: firstContact.id,
      customer: firstContact.name,
      title: `${firstContact.trade} diagnostic visit`,
      trade: firstContact.trade,
      status: "Scheduled",
      priority: "High",
      scheduled: "Today",
      window: "3:00 PM - 5:00 PM",
      technician: technicians.find((tech) => tech.trade === firstContact.trade)?.name ?? technicians[0].name,
      amount: 425,
      notes: "Created from dashboard quick action.",
    };
    setJobs((current) => [newJob, ...current]);
  }

  function sendSms() {
    const contact = contacts[0];
    setMessages((current) => [
      {
        id: `m${Date.now()}`,
        contact: contact.name,
        channel: "SMS",
        direction: "Outbound",
        body: selectedTemplate,
        outcome: "Queued for delivery",
        time: "Just now",
      },
      ...current,
    ]);
  }

  function logCall() {
    const contact = contacts[1] ?? contacts[0];
    setMessages((current) => [
      {
        id: `m${Date.now()}`,
        contact: contact.name,
        channel: "Call",
        direction: "Inbound",
        body: "Office logged a new call and attached it to the customer timeline.",
        outcome: "Callback task created",
        time: "Just now",
      },
      ...current,
    ]);
    setTasks((current) => [
      { id: `task${Date.now()}`, title: `Call back ${contact.name}`, owner: "Dispatcher", due: "15 min", impact: "Speed-to-lead SLA", completed: false },
      ...current,
    ]);
  }

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-6 py-20">
      <SectionTitle eyebrow="Operational demo" title="Run the office from one command center" text="These workflows are live in the browser with typed state: add contacts, schedule jobs, log calls, send SMS templates, and close tasks." />

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="mt-4 glass rounded-3xl p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-950">Today&apos;s operating snapshot</h3>
            <p className="text-slate-600">Open scheduled revenue: {currency.format(openRevenue)} across {jobs.length} jobs.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={schedulePriorityJob} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Schedule priority job</button>
            <button onClick={logCall} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-900">Log inbound call</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-black">Contacts</h3>
            <Badge>{contacts.length} records</Badge>
          </div>
          <div className="mt-4"><ContactForm onAdd={(contact) => setContacts((current) => [contact, ...current])} /></div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {contacts.map((contact) => (
              <div key={contact.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><strong>{contact.name}</strong><Badge tone="slate">{contact.trade}</Badge>{contact.tags.map((tag) => <Badge key={tag} tone="amber">{tag}</Badge>)}</div>
                  <p className="mt-1 text-sm text-slate-600">{contact.phone} · {contact.address}</p>
                  <p className="mt-1 text-sm text-slate-500">Next: {contact.nextAction}</p>
                </div>
                <div className="text-right text-sm"><p className="font-bold">{currency.format(contact.lifetimeValue)}</p><p className="text-slate-500">{contact.source}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <h3 className="text-xl font-black">Communications hub</h3>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="text-sm font-bold text-slate-600" htmlFor="sms-template">SMS template</label>
            <select id="sms-template" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value)}>
              {smsTemplates.map((template) => <option key={template}>{template}</option>)}
            </select>
            <button onClick={sendSms} className="mt-3 w-full rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white">Send demo SMS</button>
          </div>
          <div className="mt-4 space-y-3">
            {messages.slice(0, 5).map((message) => (
              <div key={message.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between"><strong>{message.contact}</strong><Badge tone={message.channel === "Call" ? "red" : message.channel === "SMS" ? "green" : "slate"}>{message.channel}</Badge></div>
                <p className="mt-2 text-sm text-slate-600">{message.body}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">{message.time} · {message.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-3xl p-5">
          <h3 className="text-xl font-black">Dispatch schedule</h3>
          <div className="mt-4 grid gap-3">
            {jobs.map((job) => (
              <div key={job.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto]">
                <div><div className="flex flex-wrap items-center gap-2"><strong>{job.title}</strong><Badge tone={job.priority === "Emergency" ? "red" : job.priority === "High" ? "amber" : "slate"}>{job.priority}</Badge><Badge>{job.status}</Badge></div><p className="mt-1 text-sm text-slate-600">{job.customer} · {job.scheduled}, {job.window} · {job.technician}</p><p className="mt-1 text-sm text-slate-500">{job.notes}</p></div>
                <p className="text-right font-black">{currency.format(job.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <h3 className="text-xl font-black">Technician capacity</h3>
          <div className="mt-4 space-y-4">
            {technicians.map((tech) => (
              <div key={tech.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex justify-between"><strong>{tech.name}</strong><span className="text-sm text-slate-500">⭐ {tech.rating}</span></div>
                <p className="text-sm text-slate-600">{tech.trade} · {tech.area}</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.round((tech.booked / tech.capacity) * 100)}%` }} /></div>
                <p className="mt-1 text-xs text-slate-500">{tech.booked}/{tech.capacity} hours booked</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-3xl p-5">
        <h3 className="text-xl font-black">Owner task queue</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <button key={task.id} onClick={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} className={`rounded-2xl border p-4 text-left transition ${task.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
              <div className="flex items-center justify-between gap-3"><strong>{task.title}</strong><Badge tone={task.completed ? "green" : "amber"}>{task.completed ? "Done" : task.due}</Badge></div>
              <p className="mt-2 text-sm text-slate-600">Owner: {task.owner} · {task.impact}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-[#f7f7f2]/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-xl font-black tracking-tight">HomeFlow<span className="text-emerald-700">CRM</span></a>
          <div className="hidden items-center gap-6 text-sm font-bold text-slate-700 md:flex"><a href="#features">Features</a><a href="#dashboard">Dashboard</a><a href="#plan">Plan</a><a href="#pricing">Pricing</a></div>
          <a className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white" href="/dashboard">Open CRM app</a>
        </nav>
      </header>

      <section id="top" className="grid-bg mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge tone="amber">Built for HVAC, plumbing, roofing, electrical, and field teams</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">The CRM that turns every call into a booked home service job.</h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-650">HomeFlow CRM combines scheduling, call tracking, SMS, contact history, dispatch, estimates, and owner reporting in a fast modern SaaS workspace.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white shadow-lg shadow-emerald-700/20" href="/dashboard">Launch CRM app</a><a className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-950" href="#dashboard">Try inline demo</a><a className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-950" href="#plan">Read the build plan</a></div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3"><div><p className="text-3xl font-black">&lt;5m</p><p className="text-sm text-slate-600">lead response goal</p></div><div><p className="text-3xl font-black">6 trades</p><p className="text-sm text-slate-600">ready workflows</p></div><div><p className="text-3xl font-black">10 modules</p><p className="text-sm text-slate-600">CRM + dispatch</p></div></div>
          </div>
          <div className="glass rounded-[2rem] p-5">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between"><strong>Live lead command</strong><Badge tone="green">SLA safe</Badge></div>
              <div className="mt-5 space-y-3">
                {seedMessages.slice(0, 3).map((message) => <div key={message.id} className="rounded-2xl bg-white/10 p-4"><p className="font-bold">{message.contact}</p><p className="mt-1 text-sm text-white/75">{message.body}</p></div>)}
              </div>
              <div className="mt-5 rounded-2xl bg-emerald-500 p-4 text-emerald-950"><p className="text-sm font-bold uppercase tracking-widest">Recommended next action</p><p className="mt-1 text-2xl font-black">Dispatch Sam now and text ETA.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle eyebrow="What the market needs" title="Less admin, faster booking, better field visibility" text="Research across leading home-service CRMs shows the winning product needs vertical scheduling, communication, contact intelligence, and simple revenue controls in one place." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{modules.map((module) => <div key={module} className="glass rounded-3xl p-5"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 font-black text-emerald-800">✓</div><h3 className="font-black">{module}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Designed for office staff, owners, and technicians who need a clean workflow without enterprise bloat.</p></div>)}</div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle eyebrow="Competitive read" title="Built to compete where incumbents feel heavy" text="ServiceTitan, Housecall Pro, Jobber, FieldEdge, and QuoteIQ prove demand. The wedge is faster setup plus call/SMS/schedule context for small and mid-market contractors." />
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10">
            {competitors.map((item) => <div key={item.name} className="grid gap-3 border-b border-white/10 bg-white/[0.03] p-5 last:border-b-0 md:grid-cols-[0.5fr_1fr_1fr]"><strong>{item.name}</strong><p className="text-white/75">{item.strength}</p><p className="text-amber-200">Opportunity: {item.gap}</p></div>)}
          </div>
        </div>
      </section>

      <Dashboard />

      <section id="plan" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle eyebrow="Full-proof implementation plan" title="Production backend path is mapped" text="The prototype works today in demo mode and includes the exact next steps for Clerk, Convex, Twilio, Stripe, RBAC, and tenant isolation." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {["Clerk: protect dashboard routes, map users to organizations, role-gate owner/admin/dispatcher/tech actions.", "Convex: use schema draft for contacts, jobs, technicians, messages, tasks, and tenant indexes.", "Twilio + Stripe: wire calls/SMS/reminders and collect deposits, invoice payments, and maintenance subscriptions."].map((step, index) => <div key={step} className="glass rounded-3xl p-6"><p className="text-sm font-black text-emerald-700">STEP {index + 1}</p><p className="mt-3 text-lg font-bold leading-7">{step}</p></div>)}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass rounded-[2rem] p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div><Badge tone="amber">Launch offer</Badge><h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Start with the operating system, add automation as you grow.</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Recommended pricing: Starter $149/mo, Growth $349/mo, Pro $699/mo plus usage-based phone/SMS. Keep onboarding under one week for teams under 20 technicians.</p></div>
            <a className="rounded-2xl bg-slate-950 px-7 py-4 text-center font-black text-white" href="#dashboard">Review demo</a>
          </div>
        </div>
      </section>
    </main>
  );
}
