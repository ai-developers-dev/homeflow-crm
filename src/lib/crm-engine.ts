import {
  contacts as seedContacts,
  jobs as seedJobs,
  messages as seedMessages,
  tasks as seedTasks,
  technicians as seedTechnicians,
  type Contact,
  type Estimate,
  type EstimateLineItem,
  type Invoice,
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
  estimates: Estimate[];
  invoices: Invoice[];
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
    estimates: [],
    invoices: [],
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

export type EstimateInput = {
  jobId: string;
  lineItems: EstimateLineItem[];
  financingOffered?: boolean;
  depositRequired?: number;
};

function findJob(state: DashboardState, jobId: string) {
  const job = state.jobs.find((candidate) => candidate.id === jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  return job;
}

function findEstimate(state: DashboardState, estimateId: string) {
  const estimate = state.estimates.find((candidate) => candidate.id === estimateId);
  if (!estimate) {
    throw new Error(`Estimate ${estimateId} not found`);
  }
  return estimate;
}

function findInvoice(state: DashboardState, invoiceId: string) {
  const invoice = state.invoices.find((candidate) => candidate.id === invoiceId);
  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }
  return invoice;
}

function calculateLineItemTotal(item: EstimateLineItem) {
  if (!item.description.trim()) {
    throw new Error("Every estimate line item needs a description");
  }
  if (item.quantity <= 0 || item.unitPrice < 0) {
    throw new Error("Estimate line items need a positive quantity and non-negative unit price");
  }
  return item.quantity * item.unitPrice;
}

export function createEstimateForJob(state: DashboardState, input: EstimateInput): Estimate {
  const job = findJob(state, input.jobId);
  const contact = findContact(state, job.contactId);
  if (input.lineItems.length === 0) {
    throw new Error("At least one estimate line item is required");
  }
  const subtotal = input.lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
  const estimate: Estimate = {
    id: createId("est"),
    jobId: job.id,
    contactId: contact.id,
    customer: contact.name,
    status: "Sent",
    lineItems: input.lineItems.map((item) => ({ ...item, description: item.description.trim() })),
    subtotal,
    total: subtotal,
    depositRequired: input.depositRequired ?? 0,
    financingOffered: input.financingOffered ?? false,
    createdAt: new Date().toISOString(),
  };

  state.estimates.unshift(estimate);
  contact.nextAction = "Review estimate and collect approval";
  state.tasks.unshift({
    id: createId("task"),
    title: `Follow up estimate with ${contact.name}`,
    owner: "Sales",
    due: "Today",
    impact: `Protect ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(estimate.total)} opportunity`,
    completed: false,
  });
  return estimate;
}

export function approveEstimate(state: DashboardState, estimateId: string): Estimate {
  const estimate = findEstimate(state, estimateId);
  estimate.status = "Approved";
  const contact = findContact(state, estimate.contactId);
  contact.nextAction = "Collect deposit and schedule production";
  state.tasks.unshift({
    id: createId("task"),
    title: `Collect deposit from ${estimate.customer}`,
    owner: "CSR",
    due: "Today",
    impact: "Move approved estimate into production",
    completed: false,
  });
  return estimate;
}

export function createInvoiceFromEstimate(state: DashboardState, estimateId: string, checkoutRef?: string): Invoice {
  const estimate = findEstimate(state, estimateId);
  if (estimate.status !== "Approved") {
    throw new Error("Only approved estimates can be invoiced");
  }
  const job = findJob(state, estimate.jobId);
  const invoice: Invoice = {
    id: createId("inv"),
    estimateId: estimate.id,
    jobId: estimate.jobId,
    contactId: estimate.contactId,
    customer: estimate.customer,
    status: "Open",
    amountDue: estimate.total,
    amountPaid: 0,
    paymentProviderRef: checkoutRef,
    checkoutUrl: checkoutRef ? `https://checkout.stripe.com/pay/${checkoutRef}` : undefined,
    createdAt: new Date().toISOString(),
  };

  state.invoices.unshift(invoice);
  job.status = "Invoiced";
  return invoice;
}

export function recordPaymentForInvoice(state: DashboardState, invoiceId: string, amount: number, providerRef?: string): Invoice {
  if (amount <= 0) {
    throw new Error("Payment amount must be positive");
  }
  const invoice = findInvoice(state, invoiceId);
  const job = findJob(state, invoice.jobId);
  const contact = findContact(state, invoice.contactId);
  invoice.amountPaid = Math.min(invoice.amountDue, invoice.amountPaid + amount);
  invoice.paymentProviderRef = providerRef ?? invoice.paymentProviderRef;
  invoice.status = invoice.amountPaid >= invoice.amountDue ? "Paid" : "Partially Paid";
  if (invoice.status === "Paid") {
    job.status = "Completed";
    contact.lifetimeValue += invoice.amountDue;
    contact.nextAction = "Ask for review and maintenance-plan enrollment";
    state.tasks.unshift({
      id: createId("task"),
      title: `Request review and maintenance plan from ${contact.name}`,
      owner: "CSR",
      due: "Tomorrow",
      impact: "Turn completed job into recurring revenue and social proof",
      completed: false,
    });
  }
  return invoice;
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
