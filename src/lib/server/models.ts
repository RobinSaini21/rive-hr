import mongoose, { Schema, models } from 'mongoose';
import {
  CandidateStatus,
  DocumentType,
  FeedbackRecommendation,
  InterviewStatus,
  InterviewType,
  JobStatus,
} from './enums';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const JobOpeningSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    status: { type: String, enum: JobStatus, default: JobStatus.OPEN },
  },
  { timestamps: true },
);

const CandidateSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    location: String,
    currentRole: String,
    noticePeriod: String,
    salaryExpectation: String,
    linkedinUrl: String,
    status: {
      type: String,
      enum: CandidateStatus,
      default: CandidateStatus.APPLIED,
    },
    rejectionReason: String,
    jobOpeningId: { type: Schema.Types.ObjectId, ref: 'JobOpening', required: true },
    magicLinkToken: { type: String, unique: true, sparse: true },
    magicLinkExpiresAt: Date,
    magicLinkUsed: { type: Boolean, default: false },
    offerRoleTitle: String,
    offerSalaryCurrency: String,
    offerSalaryAmount: Number,
    offerStartDate: Date,
    offerManager: String,
    offerLocation: String,
  },
  { timestamps: true },
);

const InterviewSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    type: { type: String, enum: InterviewType, required: true },
    scheduledAt: { type: Date, required: true },
    interviewerName: { type: String, required: true },
    notes: String,
    status: { type: String, enum: InterviewStatus, default: InterviewStatus.SCHEDULED },
    feedbackRecommendation: { type: String, enum: FeedbackRecommendation },
    feedbackNote: String,
  },
  { timestamps: true },
);

const TimelineEventSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const StoredDocumentSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    type: { type: String, enum: DocumentType, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const User = models.User ?? mongoose.model('User', UserSchema);
export const JobOpening = models.JobOpening ?? mongoose.model('JobOpening', JobOpeningSchema);
export const Candidate = models.Candidate ?? mongoose.model('Candidate', CandidateSchema);
export const Interview = models.Interview ?? mongoose.model('Interview', InterviewSchema);
export const TimelineEvent =
  models.TimelineEvent ?? mongoose.model('TimelineEvent', TimelineEventSchema);
export const StoredDocument =
  models.StoredDocument ?? mongoose.model('StoredDocument', StoredDocumentSchema);
