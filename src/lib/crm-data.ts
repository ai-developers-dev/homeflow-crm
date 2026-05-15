export type Trade = "HVAC" | "Plumbing" | "Roofing" | "Electrical" | "Landscaping" | "Restoration";

export type Contact = {
  id: string;
  name: string;
  company?: string;
  trade: Trade;
  phone: string;
  email: string;
  address: string;
  source: string;
  tags: string[];
  lifetimeValue: number;
  nextAction: string;
  lastContact: string;
};

export type Job = {
  id: string;
  contactId: string;
  customer: string;
  title: string;
  trade: Trade;
  status: "New" | "Scheduled" | "In Progress" | "Completed" | "Invoiced";
  priority: "Low" | "Normal" | "High" | "Emergency";
  scheduled: string;
  window: string;
  technician: string;
  amount: number;
  notes: string;
};

export type Technician = {
  id: string;
  name: string;
  trade: Trade;
  area: string;
  capacity: number;
  booked: number;
  rating: number;
};

export type Message = {
  id: string;
  contact: string;
  channel: "Call" | "SMS" | "Email";
  direction: "Inbound" | "Outbound";
  body: string;
  outcome: string;
  time: string;
};

export type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  impact: string;
  completed: boolean;
};

export type EstimateLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Estimate = {
  id: string;
  jobId: string;
  contactId: string;
  customer: string;
  status: "Draft" | "Sent" | "Approved" | "Declined";
  lineItems: EstimateLineItem[];
  subtotal: number;
  total: number;
  depositRequired: number;
  financingOffered: boolean;
  createdAt: string;
};

export type Invoice = {
  id: string;
  estimateId: string;
  jobId: string;
  contactId: string;
  customer: string;
  status: "Open" | "Partially Paid" | "Paid" | "Void";
  amountDue: number;
  amountPaid: number;
  paymentProviderRef?: string;
  checkoutUrl?: string;
  createdAt: string;
};

export const competitors = [
  { name: "ServiceTitan", strength: "Enterprise operations, dispatch, call tracking, pricebook", gap: "Heavy setup and cost for smaller teams" },
  { name: "Housecall Pro", strength: "Scheduling, invoicing, payments, reminders", gap: "Less customizable sales pipeline and reporting depth" },
  { name: "Jobber", strength: "Simple CRM, quotes, jobs, client hub", gap: "Trade-specific workflows can require workarounds" },
  { name: "QuoteIQ", strength: "Fast estimates and follow-up for service pros", gap: "Needs deeper dispatch and office command center" },
  { name: "FieldEdge", strength: "Dispatch and QuickBooks workflows", gap: "Modern UX and SMS-first selling can be stronger" },
];

export const contacts: Contact[] = [
  { id: "c1", name: "Maria Ortega", trade: "HVAC", phone: "(512) 555-0188", email: "maria@example.com", address: "1841 Bluebonnet Ln, Austin TX", source: "Google Local Services", tags: ["maintenance plan", "high intent"], lifetimeValue: 8420, nextAction: "Send replacement estimate follow-up", lastContact: "12 minutes ago" },
  { id: "c2", name: "Beacon Ridge HOA", company: "Beacon Ridge HOA", trade: "Roofing", phone: "(214) 555-0141", email: "board@beaconridge.test", address: "9 Beacon Ridge Dr, Dallas TX", source: "Referral", tags: ["commercial", "storm damage"], lifetimeValue: 46200, nextAction: "Book drone inspection", lastContact: "1 hour ago" },
  { id: "c3", name: "Eli Turner", trade: "Plumbing", phone: "(713) 555-0165", email: "eli@example.com", address: "77 Cypress Bend, Houston TX", source: "Website chat", tags: ["emergency", "after hours"], lifetimeValue: 1260, nextAction: "Confirm technician ETA", lastContact: "4 minutes ago" },
  { id: "c4", name: "Nina Park", trade: "Electrical", phone: "(469) 555-0133", email: "nina@example.com", address: "420 Cedar Flats, Plano TX", source: "Facebook ad", tags: ["panel upgrade", "financing"], lifetimeValue: 5300, nextAction: "Pre-qualify financing", lastContact: "Yesterday" },
];

export const technicians: Technician[] = [
  { id: "t1", name: "Andre Lewis", trade: "HVAC", area: "North Austin", capacity: 8, booked: 6, rating: 4.9 },
  { id: "t2", name: "Sam Cho", trade: "Plumbing", area: "Houston Loop", capacity: 8, booked: 7, rating: 4.8 },
  { id: "t3", name: "Riley Stone", trade: "Roofing", area: "DFW West", capacity: 10, booked: 4, rating: 4.7 },
  { id: "t4", name: "Jo Bell", trade: "Electrical", area: "Plano/Frisco", capacity: 8, booked: 5, rating: 4.9 },
];

export const jobs: Job[] = [
  { id: "j1", contactId: "c1", customer: "Maria Ortega", title: "Heat pump replacement estimate", trade: "HVAC", status: "Scheduled", priority: "High", scheduled: "Today", window: "10:00 AM - 12:00 PM", technician: "Andre Lewis", amount: 11800, notes: "Customer asked about 0% financing and quieter outdoor unit." },
  { id: "j2", contactId: "c3", customer: "Eli Turner", title: "Burst pipe emergency", trade: "Plumbing", status: "In Progress", priority: "Emergency", scheduled: "Today", window: "Now", technician: "Sam Cho", amount: 950, notes: "Water shutoff complete. Need mitigation partner if drywall affected." },
  { id: "j3", contactId: "c2", customer: "Beacon Ridge HOA", title: "Storm damage inspection", trade: "Roofing", status: "New", priority: "Normal", scheduled: "Tomorrow", window: "2:00 PM - 4:00 PM", technician: "Riley Stone", amount: 24500, notes: "Bring drone, insurance photo checklist, and board packet." },
  { id: "j4", contactId: "c4", customer: "Nina Park", title: "Panel upgrade quote", trade: "Electrical", status: "Scheduled", priority: "Normal", scheduled: "Friday", window: "8:00 AM - 10:00 AM", technician: "Jo Bell", amount: 5300, notes: "Potential EV charger add-on." },
];

export const messages: Message[] = [
  { id: "m1", contact: "Eli Turner", channel: "Call", direction: "Inbound", body: "Emergency burst pipe. Customer needs immediate dispatch.", outcome: "Converted to emergency job", time: "4 min ago" },
  { id: "m2", contact: "Maria Ortega", channel: "SMS", direction: "Outbound", body: "Hi Maria, Andre is confirmed for 10-12 today. Reply C to confirm.", outcome: "Awaiting confirmation", time: "12 min ago" },
  { id: "m3", contact: "Beacon Ridge HOA", channel: "Email", direction: "Outbound", body: "Sent inspection scope and insurance documentation checklist.", outcome: "Opened", time: "1 hr ago" },
  { id: "m4", contact: "Nina Park", channel: "Call", direction: "Inbound", body: "Asked about financing for electrical panel and EV charger bundle.", outcome: "Follow-up task created", time: "Yesterday" },
];

export const tasks: Task[] = [
  { id: "task1", title: "Call back 3 missed calls under 15 minutes", owner: "Dispatcher", due: "Now", impact: "Protect $7.4k estimated pipeline", completed: false },
  { id: "task2", title: "Send storm inspection prep packet", owner: "Sales", due: "Today 3 PM", impact: "Improve HOA close rate", completed: false },
  { id: "task3", title: "Review aging estimates over $5k", owner: "Owner", due: "Today", impact: "$39.8k open revenue", completed: false },
  { id: "task4", title: "Confirm tomorrow's maintenance plan visits", owner: "CSR", due: "5 PM", impact: "Reduce no-shows", completed: true },
];

export const metrics = [
  { label: "Booked revenue", value: "$48.2k", delta: "+18% vs last week" },
  { label: "Lead response", value: "3m 42s", delta: "Goal under 5m" },
  { label: "Open estimates", value: "$91.6k", delta: "22 proposals" },
  { label: "Schedule utilization", value: "78%", delta: "6 open slots today" },
];

export const smsTemplates = [
  "Thanks for calling. We can help today. What is the best address for service?",
  "Your technician is on the way. Track ETA and reply with gate or parking notes.",
  "Your estimate is ready. Want us to hold the earliest install window?",
  "It has been 6 months since your last service. Want to schedule maintenance?",
];
