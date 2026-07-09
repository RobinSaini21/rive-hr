import { addDays } from 'date-fns';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { getWebUrl } from './auth';
import { connectDb } from './db';
import {
  Candidate,
  Interview,
  JobOpening,
  StoredDocument,
  TimelineEvent,
} from './models';
import { CandidateStatus, DocumentType } from './enums';
import { ensureJobOpen } from './jobs';
import * as files from './files';
import * as pdf from './pdf';

export async function listCandidates(filters: {
  status?: CandidateStatus;
  search?: string;
}) {
  await connectDb();

  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;

  let candidates = await Candidate.find(query).sort({ updatedAt: -1 }).lean();

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    const jobIds = await JobOpening.find({ title: { $regex: q, $options: 'i' } })
      .select('_id')
      .lean();
    const jobIdSet = new Set(jobIds.map((j) => j._id.toString()));

    candidates = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        jobIdSet.has(c.jobOpeningId.toString()),
    );
  }

  const jobIds = [...new Set(candidates.map((c) => c.jobOpeningId.toString()))];
  const jobs = await JobOpening.find({ _id: { $in: jobIds } })
    .select('title status')
    .lean();
  const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));

  return candidates.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    status: c.status,
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
    jobOpening: jobMap.get(c.jobOpeningId.toString())
      ? {
          id: c.jobOpeningId.toString(),
          title: jobMap.get(c.jobOpeningId.toString())!.title,
          status: jobMap.get(c.jobOpeningId.toString())!.status,
        }
      : null,
  }));
}

export async function getCandidate(id: string) {
  await connectDb();

  const candidate = await Candidate.findById(id).lean();
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const [job, documents, interviews, timelineEvents] = await Promise.all([
    JobOpening.findById(candidate.jobOpeningId).lean(),
    StoredDocument.find({ candidateId: candidate._id }).sort({ createdAt: -1 }).lean(),
    Interview.find({ candidateId: candidate._id }).sort({ scheduledAt: -1 }).lean(),
    TimelineEvent.find({ candidateId: candidate._id }).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    id: candidate._id.toString(),
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location,
    currentRole: candidate.currentRole,
    noticePeriod: candidate.noticePeriod,
    salaryExpectation: candidate.salaryExpectation,
    linkedinUrl: candidate.linkedinUrl,
    status: candidate.status,
    rejectionReason: candidate.rejectionReason,
    offerRoleTitle: candidate.offerRoleTitle,
    offerSalaryCurrency: candidate.offerSalaryCurrency,
    offerSalaryAmount: candidate.offerSalaryAmount,
    offerStartDate: candidate.offerStartDate,
    offerManager: candidate.offerManager,
    offerLocation: candidate.offerLocation,
    magicLinkToken: candidate.magicLinkToken,
    magicLinkExpiresAt: candidate.magicLinkExpiresAt,
    magicLinkUsed: candidate.magicLinkUsed,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    jobOpening: job
      ? {
          id: job._id.toString(),
          title: job.title,
          description: job.description,
          skills: job.skills ?? [],
          status: job.status,
        }
      : null,
    documents: documents.map((d) => ({
      id: d._id.toString(),
      type: d.type,
      fileName: d.fileName,
      mimeType: d.mimeType,
      size: d.size,
      createdAt: d.createdAt,
    })),
    interviews: interviews.map((i) => ({
      id: i._id.toString(),
      type: i.type,
      scheduledAt: i.scheduledAt,
      interviewerName: i.interviewerName,
      notes: i.notes,
      status: i.status,
      feedbackRecommendation: i.feedbackRecommendation,
      feedbackNote: i.feedbackNote,
      createdAt: i.createdAt,
    })),
    timelineEvents: timelineEvents.map((e) => ({
      id: e._id.toString(),
      type: e.type,
      title: e.title,
      description: e.description,
      createdAt: e.createdAt,
    })),
    magicLinkUrl: candidate.magicLinkToken
      ? `${getWebUrl()}/apply/${candidate.magicLinkToken}`
      : null,
  };
}

export async function createCandidate(data: {
  name: string;
  email: string;
  jobOpeningId: string;
  resume: { originalname: string; buffer: Buffer; mimetype: string; size: number };
}) {
  await ensureJobOpen(data.jobOpeningId);

  const token = uuidv4();
  const expiresAt = addDays(new Date(), 14);

  const candidate = await Candidate.create({
    name: data.name,
    email: data.email.toLowerCase(),
    jobOpeningId: new Types.ObjectId(data.jobOpeningId),
    status: CandidateStatus.APPLIED,
    magicLinkToken: token,
    magicLinkExpiresAt: expiresAt,
  });

  await addTimelineEvent(
    candidate._id.toString(),
    'APPLIED',
    'Application received',
    'Candidate added to the pipeline with resume upload.',
  );

  await files.saveFile(candidate._id.toString(), DocumentType.RESUME, data.resume);

  return {
    ...(await getCandidate(candidate._id.toString())),
    magicLinkUrl: `${getWebUrl()}/apply/${token}`,
  };
}

export async function generateOfferDocuments(
  id: string,
  data: {
    roleTitle: string;
    salaryCurrency: string;
    salaryAmount: number;
    startDate: string;
    managerName: string;
    location: string;
  },
) {
  const candidate = await getCandidate(id);

  const allowed: CandidateStatus[] = [
    CandidateStatus.INTERVIEW_SCHEDULED,
    CandidateStatus.OFFER_SENT,
  ];

  if (!allowed.includes(candidate.status as CandidateStatus)) {
    throw new Error('Offer documents can only be generated after interview is scheduled');
  }

  const startDate = new Date(data.startDate);

  const offerBuffer = await pdf.generateOfferLetter({
    candidateName: candidate.name,
    roleTitle: data.roleTitle,
    salaryCurrency: data.salaryCurrency,
    salaryAmount: data.salaryAmount,
    startDate,
    managerName: data.managerName,
    location: data.location,
  });

  const ndaBuffer = await pdf.generateNda({
    candidateName: candidate.name,
    date: new Date(),
  });

  await files.saveBuffer(
    id,
    DocumentType.OFFER_LETTER,
    offerBuffer,
    `Offer-Letter-${candidate.name.replace(/\s+/g, '-')}.pdf`,
    'application/pdf',
  );

  await files.saveBuffer(
    id,
    DocumentType.NDA,
    ndaBuffer,
    `NDA-${candidate.name.replace(/\s+/g, '-')}.pdf`,
    'application/pdf',
  );

  await Candidate.findByIdAndUpdate(id, {
    status: CandidateStatus.OFFER_SENT,
    offerRoleTitle: data.roleTitle,
    offerSalaryCurrency: data.salaryCurrency,
    offerSalaryAmount: data.salaryAmount,
    offerStartDate: startDate,
    offerManager: data.managerName,
    offerLocation: data.location,
  });

  await addTimelineEvent(
    id,
    'OFFER_SENT',
    'Offer documents generated',
    `Offer letter and NDA prepared for ${data.roleTitle}.`,
  );

  return getCandidate(id);
}

export async function markHired(id: string) {
  const candidate = await getCandidate(id);

  if (candidate.status === CandidateStatus.HIRED) {
    throw new Error('Candidate is already hired');
  }
  if (candidate.status === CandidateStatus.REJECTED) {
    throw new Error('Rejected candidates cannot be hired');
  }

  const hasOffer = candidate.documents.some((d) => d.type === DocumentType.OFFER_LETTER);
  if (!hasOffer) {
    throw new Error('An offer must be generated before marking as hired');
  }

  await Candidate.findByIdAndUpdate(id, { status: CandidateStatus.HIRED });
  await addTimelineEvent(id, 'HIRED', 'Candidate hired', 'Candidate marked as hired.');

  return getCandidate(id);
}

export async function markRejected(id: string, reason: string) {
  const candidate = await getCandidate(id);

  if (candidate.status === CandidateStatus.HIRED) {
    throw new Error('Hired candidates cannot be rejected');
  }
  if (candidate.status === CandidateStatus.REJECTED) {
    throw new Error('Candidate is already rejected');
  }

  await Candidate.findByIdAndUpdate(id, {
    status: CandidateStatus.REJECTED,
    rejectionReason: reason,
  });

  await addTimelineEvent(id, 'REJECTED', 'Candidate rejected', reason);

  return getCandidate(id);
}

export async function addTimelineEvent(
  candidateId: string,
  type: string,
  title: string,
  description?: string,
) {
  await connectDb();
  await TimelineEvent.create({
    candidateId: new Types.ObjectId(candidateId),
    type,
    title,
    description,
  });
}
