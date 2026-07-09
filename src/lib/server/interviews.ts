import { Types } from 'mongoose';
import { connectDb } from './db';
import { Candidate, Interview, JobOpening } from './models';
import {
  CandidateStatus,
  FeedbackRecommendation,
  InterviewStatus,
  InterviewType,
} from './enums';
import { addTimelineEvent, getCandidate } from './candidates';

export async function listInterviews() {
  await connectDb();

  const interviews = await Interview.find().sort({ scheduledAt: 1 }).lean();
  const candidateIds = [...new Set(interviews.map((i) => i.candidateId.toString()))];
  const candidates = await Candidate.find({ _id: { $in: candidateIds } }).lean();
  const candidateMap = new Map(candidates.map((c) => [c._id.toString(), c]));

  const jobIds = [...new Set(candidates.map((c) => c.jobOpeningId.toString()))];
  const jobs = await JobOpening.find({ _id: { $in: jobIds } }).lean();
  const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));

  return interviews.map((i) => {
    const candidate = candidateMap.get(i.candidateId.toString());
    const job = candidate ? jobMap.get(candidate.jobOpeningId.toString()) : null;

    return {
      id: i._id.toString(),
      type: i.type,
      scheduledAt: i.scheduledAt,
      interviewerName: i.interviewerName,
      notes: i.notes,
      status: i.status,
      feedbackRecommendation: i.feedbackRecommendation,
      feedbackNote: i.feedbackNote,
      candidate: candidate
        ? {
            id: candidate._id.toString(),
            name: candidate.name,
            email: candidate.email,
            status: candidate.status,
            jobOpening: job ? { title: job.title } : null,
          }
        : null,
    };
  });
}

export async function scheduleInterview(
  candidateId: string,
  data: {
    scheduledAt: string;
    type: InterviewType;
    interviewerName: string;
    notes?: string;
  },
) {
  const candidate = await getCandidate(candidateId);

  if (
    candidate.status === CandidateStatus.REJECTED ||
    candidate.status === CandidateStatus.HIRED
  ) {
    throw new Error('Cannot schedule interviews for terminal candidates');
  }

  const interview = await Interview.create({
    candidateId: new Types.ObjectId(candidateId),
    type: data.type,
    scheduledAt: new Date(data.scheduledAt),
    interviewerName: data.interviewerName,
    notes: data.notes,
  });

  await Candidate.findByIdAndUpdate(candidateId, {
    status: CandidateStatus.INTERVIEW_SCHEDULED,
  });

  await addTimelineEvent(
    candidateId,
    'INTERVIEW_SCHEDULED',
    `${data.type === InterviewType.SCREENING ? 'Screening' : 'Technical'} interview scheduled`,
    `With ${data.interviewerName} on ${new Date(data.scheduledAt).toLocaleString()}.`,
  );

  return {
    id: interview._id.toString(),
    type: interview.type,
    scheduledAt: interview.scheduledAt,
    interviewerName: interview.interviewerName,
    notes: interview.notes,
    status: interview.status,
  };
}

export async function completeInterview(
  id: string,
  data: { recommendation: FeedbackRecommendation; note?: string },
) {
  await connectDb();

  const interview = await Interview.findById(id);
  if (!interview) {
    throw new Error('Interview not found');
  }
  if (interview.status === InterviewStatus.COMPLETED) {
    throw new Error('Interview already completed');
  }

  interview.status = InterviewStatus.COMPLETED;
  interview.feedbackRecommendation = data.recommendation;
  interview.feedbackNote = data.note;
  await interview.save();

  await addTimelineEvent(
    interview.candidateId.toString(),
    'INTERVIEW_FEEDBACK',
    'Interview feedback recorded',
    `${data.recommendation.replace('_', ' ')}${data.note ? `: ${data.note}` : ''}`,
  );

  return {
    id: interview._id.toString(),
    status: interview.status,
    feedbackRecommendation: interview.feedbackRecommendation,
    feedbackNote: interview.feedbackNote,
  };
}
