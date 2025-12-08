import { CasePriority, CaseStatus, VolunteerSkill, VolunteerRole, Vulnerability, AidCategory } from '@/lib/types/dracp';

export const AID_CATEGORIES: { id: AidCategory; label: string; icon: string; description: string }[] = [
  { id: 'FOOD', label: 'Food Supplies', icon: '🍚', description: 'Rice, dry rations, cooked meals' },
  { id: 'WATER', label: 'Drinking Water', icon: '💧', description: 'Clean drinking water, water bottles' },
  { id: 'SANITATION', label: 'Sanitation Items', icon: '🧼', description: 'Soap, detergent, hygiene products' },
  { id: 'CLOTHING', label: 'Clothing', icon: '👕', description: 'Clothes, blankets, bedding' },
  { id: 'SHELTER', label: 'Shelter', icon: '🏠', description: 'Temporary shelter, tarpaulins' },
  { id: 'MEDICAL', label: 'Medical', icon: '💊', description: 'Medicine, first aid, medical attention' },
  { id: 'EVACUATION', label: 'Evacuation', icon: '🚨', description: 'Emergency evacuation assistance' },
  { id: 'RESCUE', label: 'Rescue', icon: '🆘', description: 'Search and rescue operations' },
  { id: 'ELECTRICITY', label: 'Electricity', icon: '⚡', description: 'Power restoration, generators' },
  { id: 'COMMUNICATION', label: 'Communication', icon: '📱', description: 'Communication assistance' },
  { id: 'TRANSPORT', label: 'Transportation', icon: '🚗', description: 'Transport assistance' },
  { id: 'OTHER', label: 'Other', icon: '📦', description: 'Other types of assistance' },
];

export const CASE_PRIORITIES: { id: CasePriority; label: string; color: string; slaHours: number; description: string }[] = [
  { id: 'CRITICAL', label: 'Critical', color: 'red', slaHours: 4, description: 'Life-threatening, immediate response' },
  { id: 'HIGH', label: 'High', color: 'orange', slaHours: 24, description: 'Urgent, respond within 24 hours' },
  { id: 'MEDIUM', label: 'Medium', color: 'yellow', slaHours: 48, description: 'Standard, respond within 48 hours' },
  { id: 'LOW', label: 'Low', color: 'green', slaHours: 72, description: 'Information only, respond within 72 hours' },
];

export const CASE_STATUSES: { id: CaseStatus; label: string; color: string; description: string }[] = [
  { id: 'PENDING', label: 'Pending', color: 'blue', description: 'Just created, awaiting assignment' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'cyan', description: 'Assigned to volunteer' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'yellow', description: 'Being worked on' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'orange', description: 'Waiting for resources' },
  { id: 'RESOLVED', label: 'Resolved', color: 'green', description: 'Successfully completed' },
  { id: 'CLOSED', label: 'Closed', color: 'gray', description: 'Closed without resolution' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'gray', description: 'Cancelled case' },
];

export const VOLUNTEER_SKILLS: { id: VolunteerSkill; label: string; icon: string }[] = [
  { id: 'FIRST_AID', label: 'First Aid', icon: '🩹' },
  { id: 'COUNSELING', label: 'Counseling', icon: '💬' },
  { id: 'LOGISTICS', label: 'Logistics', icon: '📦' },
  { id: 'DRIVING', label: 'Driving', icon: '🚗' },
  { id: 'BOAT_OPERATION', label: 'Boat Operation', icon: '🚤' },
  { id: 'MEDICAL_PROFESSIONAL', label: 'Medical Professional', icon: '⚕️' },
  { id: 'SOCIAL_WORK', label: 'Social Work', icon: '🤝' },
  { id: 'TRANSLATION', label: 'Translation', icon: '🌐' },
  { id: 'DATA_ENTRY', label: 'Data Entry', icon: '💻' },
  { id: 'CALL_CENTER', label: 'Call Center', icon: '📞' },
];

export const VOLUNTEER_ROLES: { id: VolunteerRole; label: string; description: string }[] = [
  { id: 'FIELD_WORKER', label: 'Field Worker', description: 'On-ground aid distribution' },
  { id: 'CALL_CENTER', label: 'Call Center', description: 'Phone support and case logging' },
  { id: 'CASE_MANAGER', label: 'Case Manager', description: 'Case triage and coordination' },
  { id: 'LOGISTICS', label: 'Logistics', description: 'Supply chain and transport' },
  { id: 'COORDINATOR', label: 'Coordinator', description: 'Team and area coordination' },
  { id: 'ADMIN', label: 'Administrator', description: 'System administration' },
];

export const VULNERABILITIES: { id: Vulnerability; label: string; icon: string }[] = [
  { id: 'ELDERLY', label: 'Elderly (65+)', icon: '👴' },
  { id: 'DISABLED', label: 'Disabled', icon: '♿' },
  { id: 'PREGNANT', label: 'Pregnant', icon: '🤰' },
  { id: 'INFANT', label: 'Infant/Toddler', icon: '👶' },
  { id: 'CHRONIC_ILLNESS', label: 'Chronic Illness', icon: '💊' },
  { id: 'SINGLE_PARENT', label: 'Single Parent', icon: '👨‍👧' },
  { id: 'NO_INCOME', label: 'No Income', icon: '💸' },
  { id: 'DISPLACED', label: 'Displaced', icon: '🏚️' },
];

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export const SMS_TEMPLATES = {
  CASE_CREATED: {
    id: 'case_created',
    name: 'Case Created',
    content: 'Dear {beneficiaryName}, your request has been registered. Case ID: {caseNumber}. We will contact you within {slaHours} hours. - ResQ Relief',
    variables: ['beneficiaryName', 'caseNumber', 'slaHours']
  },
  CASE_ASSIGNED: {
    id: 'case_assigned',
    name: 'Case Assigned',
    content: 'Dear {beneficiaryName}, your case {caseNumber} has been assigned to {volunteerName}. They will contact you shortly. - ResQ Relief',
    variables: ['beneficiaryName', 'caseNumber', 'volunteerName']
  },
  AID_DISPATCHED: {
    id: 'aid_dispatched',
    name: 'Aid Dispatched',
    content: 'Dear {beneficiaryName}, aid for case {caseNumber} has been dispatched. Expected delivery: {deliveryTime}. - ResQ Relief',
    variables: ['beneficiaryName', 'caseNumber', 'deliveryTime']
  },
  CASE_RESOLVED: {
    id: 'case_resolved',
    name: 'Case Resolved',
    content: 'Dear {beneficiaryName}, your case {caseNumber} has been resolved. Thank you for your patience. For new requests, call 117. - ResQ Relief',
    variables: ['beneficiaryName', 'caseNumber']
  },
  EMERGENCY_ALERT: {
    id: 'emergency_alert',
    name: 'Emergency Alert',
    content: 'ALERT: {alertTitle}. {alertMessage}. Stay safe. - ResQ Relief',
    variables: ['alertTitle', 'alertMessage']
  }
};

export function generateCaseNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SOS-${dateStr}-${random}`;
}

export function calculateSLADeadline(priority: CasePriority): Date {
  const priorityConfig = CASE_PRIORITIES.find(p => p.id === priority);
  const hours = priorityConfig?.slaHours || 72;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

export function isSLABreached(slaDeadline: Date, status: CaseStatus): boolean {
  const resolvedStatuses: CaseStatus[] = ['RESOLVED', 'CLOSED', 'CANCELLED'];
  if (resolvedStatuses.includes(status)) return false;
  return new Date() > new Date(slaDeadline);
}

// Re-export types for convenience
export type { VolunteerSkill, VolunteerRole, Vulnerability, AidCategory } from '@/lib/types/dracp';
