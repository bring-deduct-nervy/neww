// DRACP - Disaster Relief and Aid Coordination Platform Types

// Case Management Types
export interface Case {
  id: string;
  caseNumber: string; // Format: SOS-YYYYMMDD-XXXX
  beneficiaryId: string;
  beneficiary: Beneficiary;
  category: AidCategory;
  priority: CasePriority;
  status: CaseStatus;
  description: string;
  location: CaseLocation;
  assignedVolunteerId?: string;
  assignedVolunteer?: Volunteer;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
  notes: CaseNote[];
  statusHistory: CaseStatusChange[];
  aidItems?: AidItem[];
}

export interface Beneficiary {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  nationalId?: string;
  householdSize: number;
  address: string;
  district: string;
  gsDivision?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  vulnerabilities: Vulnerability[];
  registeredAt: Date;
  optInSms: boolean;
  optInEmail: boolean;
  cases: Case[];
  totalAidReceived: number;
}

export interface CaseLocation {
  address: string;
  district: string;
  gsDivision?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  accessNotes?: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface CaseStatusChange {
  id: string;
  caseId: string;
  fromStatus: CaseStatus;
  toStatus: CaseStatus;
  changedById: string;
  changedByName: string;
  reason?: string;
  createdAt: Date;
}

export interface AidItem {
  id: string;
  category: AidCategory;
  name: string;
  quantity: number;
  unit: string;
  distributedAt?: Date;
  distributedById?: string;
}

export type AidCategory =
  | 'FOOD'
  | 'WATER'
  | 'MEDICAL'
  | 'SHELTER'
  | 'EVACUATION'
  | 'RESCUE'
  | 'CLOTHING'
  | 'SANITATION'
  | 'ELECTRICITY'
  | 'COMMUNICATION'
  | 'TRANSPORT'
  | 'OTHER';

export type CasePriority =
  | 'CRITICAL' // Life-threatening, immediate response needed
  | 'HIGH'     // Urgent, respond within 24 hours
  | 'MEDIUM'   // Standard, respond within 48 hours
  | 'LOW';     // Information only, respond within 72 hours

export type CaseStatus =
  | 'PENDING'        // Just created
  | 'ASSIGNED'       // Assigned to volunteer
  | 'IN_PROGRESS'    // Being worked on
  | 'ON_HOLD'        // Waiting for resources
  | 'RESOLVED'       // Successfully completed
  | 'CLOSED'         // Closed without resolution
  | 'CANCELLED';     // Cancelled case

export type Vulnerability =
  | 'ELDERLY'
  | 'DISABLED'
  | 'PREGNANT'
  | 'INFANT'
  | 'CHRONIC_ILLNESS'
  | 'SINGLE_PARENT'
  | 'NO_INCOME'
  | 'DISPLACED';

// Volunteer Management Types
export interface Volunteer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  district: string;
  skills: VolunteerSkill[];
  availability: VolunteerAvailability;
  status: VolunteerStatus;
  role: VolunteerRole;
  registeredAt: Date;
  verifiedAt?: Date;
  isVerified: boolean;
  assignedCases: Case[];
  completedCases: number;
  slaMetrics: SLAMetrics;
  rating: number;
  badges: VolunteerBadge[];
}

export type VolunteerSkill =
  | 'FIRST_AID'
  | 'COUNSELING'
  | 'LOGISTICS'
  | 'DRIVING'
  | 'BOAT_OPERATION'
  | 'MEDICAL_PROFESSIONAL'
  | 'SOCIAL_WORK'
  | 'TRANSLATION'
  | 'DATA_ENTRY'
  | 'CALL_CENTER';

export type VolunteerAvailability =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'WEEKENDS'
  | 'ON_CALL'
  | 'UNAVAILABLE';

export type VolunteerStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ON_ASSIGNMENT'
  | 'ON_BREAK'
  | 'SUSPENDED';

export type VolunteerRole =
  | 'FIELD_WORKER'
  | 'CALL_CENTER'
  | 'CASE_MANAGER'
  | 'LOGISTICS'
  | 'COORDINATOR'
  | 'ADMIN';

export interface VolunteerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface SLAMetrics {
  totalCasesHandled: number;
  casesResolvedOnTime: number;
  averageResponseTime: number; // in minutes
  averageResolutionTime: number; // in hours
  slaComplianceRate: number; // percentage
  customerSatisfactionScore: number; // 1-5
}

// Communication Types
export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[]; // e.g., ['beneficiaryName', 'caseNumber', 'status']
  category: SMSCategory;
  isActive: boolean;
}

export type SMSCategory =
  | 'CASE_UPDATE'
  | 'AID_DISPATCH'
  | 'EMERGENCY_ALERT'
  | 'GENERAL_INFO'
  | 'SURVEY';

export interface SMSLog {
  id: string;
  templateId?: string;
  recipientPhone: string;
  recipientName?: string;
  content: string;
  status: SMSStatus;
  sentAt: Date;
  deliveredAt?: Date;
  errorMessage?: string;
}

export type SMSStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED';

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  channels: BroadcastChannel[];
  targetAudience: BroadcastAudience;
  districts?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: BroadcastStatus;
  recipientCount: number;
  deliveredCount: number;
  createdById: string;
}

export type BroadcastChannel =
  | 'SMS'
  | 'EMAIL'
  | 'PUSH_NOTIFICATION'
  | 'IN_APP';

export type BroadcastAudience =
  | 'ALL_BENEFICIARIES'
  | 'ALL_VOLUNTEERS'
  | 'SPECIFIC_DISTRICTS'
  | 'ACTIVE_CASES'
  | 'CUSTOM';

export type BroadcastStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED';

// Dashboard and Reporting Types
export interface DashboardStats {
  totalCases: number;
  newCasesToday: number;
  casesInProgress: number;
  casesResolved: number;
  casesByPriority: Record<CasePriority, number>;
  casesByCategory: Record<AidCategory, number>;
  casesByDistrict: Record<string, number>;
  averageResolutionTime: number;
  slaComplianceRate: number;
  totalBeneficiaries: number;
  totalVolunteers: number;
  activeVolunteers: number;
  aidDistributed: AidDistributionSummary[];
}

export interface AidDistributionSummary {
  category: AidCategory;
  totalQuantity: number;
  unit: string;
  beneficiariesReached: number;
}

export interface CaseFilter {
  status?: CaseStatus[];
  priority?: CasePriority[];
  category?: AidCategory[];
  district?: string[];
  assignedVolunteerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
  slaBreached?: boolean;
}
