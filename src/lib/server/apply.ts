import { connectDb } from './db';
import { Candidate, JobOpening, TimelineEvent } from './models';
import { CandidateStatus } from './enums';

export async function getApplication(token: string) {
  await connectDb();

  const candidate = await Candidate.findOne({ magicLinkToken: token }).lean();
  if (!candidate) {
    throw new Error('Invalid application link');
  }

  const job = await JobOpening.findById(candidate.jobOpeningId)
    .select('title status')
    .lean();

  if (candidate.magicLinkExpiresAt && candidate.magicLinkExpiresAt < new Date()) {
    return { expired: true, used: false, candidate: null };
  }

  if (candidate.magicLinkUsed) {
    return {
      expired: false,
      used: true,
      candidate: {
        name: candidate.name,
        jobTitle: job?.title ?? '',
      },
    };
  }

  return {
    expired: false,
    used: false,
    candidate: {
      name: candidate.name,
      email: candidate.email,
      jobTitle: job?.title ?? '',
    },
  };
}

export async function submitApplication(
  token: string,
  body: {
    phone: string;
    location: string;
    currentRole: string;
    noticePeriod: string;
    salaryExpectation: string;
    linkedinUrl?: string;
  },
) {
  await connectDb();

  const candidate = await Candidate.findOne({ magicLinkToken: token });
  if (!candidate) {
    throw new Error('Invalid application link');
  }

  if (candidate.magicLinkExpiresAt && candidate.magicLinkExpiresAt < new Date()) {
    throw new Error('This application link has expired');
  }

  if (candidate.magicLinkUsed) {
    throw new Error('This application has already been submitted');
  }

  candidate.phone = body.phone;
  candidate.location = body.location;
  candidate.currentRole = body.currentRole;
  candidate.noticePeriod = body.noticePeriod;
  candidate.salaryExpectation = body.salaryExpectation;
  candidate.linkedinUrl = body.linkedinUrl;
  candidate.status = CandidateStatus.FORM_SUBMITTED;
  candidate.magicLinkUsed = true;
  await candidate.save();

  await TimelineEvent.create({
    candidateId: candidate._id,
    type: 'FORM_SUBMITTED',
    title: 'Application form submitted',
    description: 'Candidate completed their application details.',
  });

  return { success: true };
}
