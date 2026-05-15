import {
  calculateOperatingSummary,
  completeTask,
  createContactFromLead,
  createEstimateForJob,
  createInvoiceFromEstimate,
  logInboundCall,
  recordPaymentForInvoice,
  scheduleJobForContact,
  seedDashboardState,
  sendSmsTemplate,
  approveEstimate,
  type CallInput,
  type DashboardState,
  type EstimateInput,
  type JobInput,
  type LeadInput,
  type SmsInput,
} from "./crm-engine";

const globalForCrm = globalThis as typeof globalThis & { __homeflowCrmState?: DashboardState };

export function getCrmState(): DashboardState {
  if (!globalForCrm.__homeflowCrmState) {
    globalForCrm.__homeflowCrmState = seedDashboardState();
  }
  return globalForCrm.__homeflowCrmState;
}

export function resetCrmState() {
  globalForCrm.__homeflowCrmState = seedDashboardState();
  return globalForCrm.__homeflowCrmState;
}

export function crmSnapshot() {
  const state = getCrmState();
  return {
    ...state,
    summary: calculateOperatingSummary(state),
  };
}

export function addCrmContact(input: LeadInput) {
  return createContactFromLead(getCrmState(), input);
}

export function addCrmJob(input: JobInput) {
  return scheduleJobForContact(getCrmState(), input);
}

export function addCrmSms(input: SmsInput) {
  return sendSmsTemplate(getCrmState(), input);
}

export function addCrmCall(input: CallInput) {
  return logInboundCall(getCrmState(), input);
}

export function markCrmTaskComplete(taskId: string) {
  return completeTask(getCrmState(), taskId);
}

export function addCrmEstimate(input: EstimateInput) {
  return createEstimateForJob(getCrmState(), input);
}

export function approveCrmEstimate(estimateId: string) {
  return approveEstimate(getCrmState(), estimateId);
}

export function addCrmInvoice(estimateId: string, checkoutRef?: string) {
  return createInvoiceFromEstimate(getCrmState(), estimateId, checkoutRef);
}

export function addCrmPayment(invoiceId: string, amount: number, providerRef?: string) {
  return recordPaymentForInvoice(getCrmState(), invoiceId, amount, providerRef);
}
