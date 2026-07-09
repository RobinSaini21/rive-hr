export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CandidateStatus {
  APPLIED = 'APPLIED',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  OFFER_SENT = 'OFFER_SENT',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export enum InterviewType {
  SCREENING = 'SCREENING',
  TECHNICAL = 'TECHNICAL',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
}

export enum FeedbackRecommendation {
  HIRE = 'HIRE',
  NO_HIRE = 'NO_HIRE',
  MAYBE = 'MAYBE',
}

export enum DocumentType {
  RESUME = 'RESUME',
  OFFER_LETTER = 'OFFER_LETTER',
  NDA = 'NDA',
}
