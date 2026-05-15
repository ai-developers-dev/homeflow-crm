import {
  calculateOperatingSummary,
  completeTask,
  createContactFromLead,
  logInboundCall,
  scheduleJobForContact,
  seedDashboardState,
  sendSmsTemplate,
  type CallInput,
  type DashboardState,
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
