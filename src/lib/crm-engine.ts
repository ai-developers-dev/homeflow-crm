import {
  contacts as seedContacts,
  jobs as seedJobs,
  messages as seedMessages,
  tasks as seedTasks,
  technicians as seedTechnicians,
  type Contact,
  type Job,
  type Message,
  type Task,
  type Technician,
  type Trade,
} from "./crm-data";

export type DashboardState = {
  contacts: Contact[];
  jobs: Job[];
  messages: Message[];
  tasks: Task[];
  technicians: Technician[];
};

export type LeadInput = {
  name: string;
  phone: string;
  trade: Trade;
  source: string;
  address: string;
  email?: string;
};

export type JobInput = {
  contactId: string;
  title: string;
  priority: Job["priority"];
  amount: number;
  scheduled: string;
  window: string;
  notes?: string;
};

export type SmsInput = {
  contactId: string;
  template: string;
};

export type CallInput = {
  contactId: string;
  note: string;
};

export type OperatingSummary = {
  openRevenue: number;
  emergencyJobs: number;
  overdueTasks: number;
  scheduleUtilization: number;
  contactsNeedingAction: number;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function findContact(state: DashboardState, contactId: string) {
  const contact = state.contacts.find((candidate) => candidate.id === contactId);
  if (!contact) {
    throw new Error(`Contact ${contactId} not found`);
  }
  return contact;
}

function normalizeSourceTag(source: string) {
  return source.trim().toLowerCase().replace(/\s+/g, " ");
}

export function seedDashboardState(): DashboardState {
  return {
    contacts: clone(seedContacts),
    jobs: clone(seedJobs),
    messages: clone(seedMessages),
    tasks: clone(seedTasks),
    technicians: clone(seedTechnicians),
  };
}

export function createContactFromLead(state: DashboardState, input: LeadInput): Contact {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 2) {
    throw new Error("Contact name is required");
  }
  if (input.phone.trim().length < 7) {
    throw new Error("A reachable phone number is required");
  }

  const contact: Contact = {
    id: createId("contact"),
    name,
    trade: input.trade,
    phone: input.phone.trim(),
    email: input.email ?? `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    address: input.address.trim(),
    source: input.source.trim(),
    tags: ["new lead", "needs qualification", normalizeSourceTag(input.source)],
    lifetimeValue: 0,
    nextAction: "Qualify and schedule estimate",
    lastContact: "Just now",
  };

  state.contacts.unshift(contact);
  state.tasks.unshift({
    id: createId("task"),
    title: `Qualify ${contact.name} and book first appointment`,
    owner: "CSR",
    due: "15 min",
    impact: "Speed-to-lead SLA",
    completed: false,
  });
  return contact;
}

export function chooseTechnicianForTrade(state: DashboardState, trade: Trade): Technician {
  const eligible = state.technicians
    .filter((tech) => tech.trade === trade)
    .sort((a, b) => a.booked / a.capacity - b.booked / b.capacity || b.rating - a.rating);
  return eligible[0] ?? state.technicians.slice().sort((a, b) => a.booked / a.capacity - b.booked / b.capacity)[0];
}

export function scheduleJobForContact(state: DashboardState, input: JobInput): Job {
  const contact = findContact(state, input.contactId);
  const technician = chooseTechnicianForTrade(state, contact.trade);
  const job: Job = {
    id: createId("job"),
    contactId: contact.id,
    customer: contact.name,
    title: input.title.trim(),
    trade: contact.trade,
    status: "Scheduled",
    priority: input.priority,
    scheduled: input.scheduled,
    window: input.window,
    technician: technician.name,
    amount: input.amount,
    notes: input.notes ?? "Scheduled from CRM command center.",
  };

  state.jobs.unshift(job);
  technician.booked = Math.min(technician.capacity, technician.booked + (input.priority === "Emergency" ? 2 : 1));
  contact.nextAction = `Confirm ${input.scheduled} ${input.window} appointment`;
  state.tasks.unshift({
    id: createId("task"),
    title: `Dispatch ${technician.name} for ${contact.name}`,
    owner: "Dispatcher",
    due: input.priority === "Emergency" ? "Now" : "Today",
    impact: `${input.priority} ${contact.trade} job worth ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(input.amount)}`,
    completed: false,
  });
  return job;
}

export function sendSmsTemplate(state: DashboardState, input: SmsInput): Message {
  const contact = findContact(state, input.contactId);
  const message: Message = {
    id: createId("msg"),
    contact: contact.name,
    channel: "SMS",
    direction: "Outbound",
    body: input.template.trim(),
    outcome: "Queued for delivery",
    time: "Just now",
  };
  state.messages.unshift(message);
  contact.lastContact = "Just now";
  return message;
}

export function logInboundCall(state: DashboardState, input: CallInput): Message {
  const contact = findContact(state, input.contactId);
  const message: Message = {
    id: createId("call"),
    contact: contact.name,
    channel: "Call",
    direction: "Inbound",
    body: input.note.trim(),
    outcome: "Callback task created",
    time: "Just now",
  };
  state.messages.unshift(message);
  state.tasks.unshift({
    id: createId("task"),
    title: `Call back ${contact.name}`,
    owner: "Dispatcher",
    due: "15 min",
    impact: "Speed-to-lead SLA",
    completed: false,
  });
  contact.lastContact = "Just now";
  return message;
}

export function completeTask(state: DashboardState, taskId: string): Task {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }
  task.completed = true;
  return task;
}

export function calculateOperatingSummary(state: DashboardState): OperatingSummary {
  const openRevenue = state.jobs
    .filter((job) => job.status !== "Completed" && job.status !== "Invoiced")
    .reduce((sum, job) => sum + job.amount, 0);
  const totalCapacity = state.technicians.reduce((sum, tech) => sum + tech.capacity, 0);
  const totalBooked = state.technicians.reduce((sum, tech) => sum + tech.booked, 0);

  return {
    openRevenue,
    emergencyJobs: state.jobs.filter((job) => job.priority === "Emergency").length,
    overdueTasks: state.tasks.filter((task) => !task.completed && ["Now", "15 min"].includes(task.due)).length,
    scheduleUtilization: totalCapacity === 0 ? 0 : totalBooked / totalCapacity,
    contactsNeedingAction: state.contacts.filter((contact) => contact.nextAction.length > 0).length,
  };
}
