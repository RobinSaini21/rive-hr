export type CandidateStatus =
  | 'APPLIED'
  | 'FORM_SUBMITTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFER_SENT'
  | 'HIRED'
  | 'REJECTED';

export type JobStatus = 'OPEN' | 'CLOSED';

export type InterviewType = 'SCREENING' | 'TECHNICAL';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED';
export type FeedbackRecommendation = 'HIRE' | 'NO_HIRE' | 'MAYBE';

export type User = {
  id: string;
  email: string;
  name: string;
};

export type JobOpening = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  status: JobStatus;
  createdAt?: string;
  updatedAt?: string;
  _count?: { candidates: number };
};

export type CandidateListItem = {
  id: string;
  name: string;
  email: string;
  status: CandidateStatus;
  updatedAt: string;
  jobOpening: { id: string; title: string; status: JobStatus } | null;
};

export type Document = {
  id: string;
  type: 'RESUME' | 'OFFER_LETTER' | 'NDA';
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type Interview = {
  id: string;
  type: InterviewType;
  scheduledAt: string;
  interviewerName: string;
  notes?: string;
  status: InterviewStatus;
  feedbackRecommendation?: FeedbackRecommendation;
  feedbackNote?: string;
  createdAt?: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
    status: CandidateStatus;
    jobOpening: { title: string } | null;
  };
};

export type TimelineEvent = {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  currentRole?: string;
  noticePeriod?: string;
  salaryExpectation?: string;
  linkedinUrl?: string;
  status: CandidateStatus;
  rejectionReason?: string;
  offerRoleTitle?: string;
  offerSalaryCurrency?: string;
  offerSalaryAmount?: number;
  offerStartDate?: string;
  offerManager?: string;
  offerLocation?: string;
  magicLinkUrl?: string | null;
  magicLinkUsed?: boolean;
  jobOpening: JobOpening | null;
  documents: Document[];
  interviews: Interview[];
  timelineEvents: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
};
