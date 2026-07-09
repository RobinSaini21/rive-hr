import { connectDb } from './db';
import { Candidate, JobOpening } from './models';
import { HttpError } from './auth';
import { JobStatus } from './enums';

export async function listJobs() {
  await connectDb();

  const jobs = await JobOpening.find().sort({ createdAt: -1 }).lean();
  const counts = await Candidate.aggregate<{ _id: unknown; count: number }>([
    { $group: { _id: '$jobOpeningId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return jobs.map((job) => ({
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    skills: job.skills ?? [],
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    _count: { candidates: countMap.get(job._id.toString()) ?? 0 },
  }));
}

export async function createJob(data: {
  title: string;
  description: string;
  skills: string[];
  status?: JobStatus;
}) {
  await connectDb();

  const job = await JobOpening.create({
    title: data.title,
    description: data.description,
    skills: data.skills,
    status: data.status ?? JobStatus.OPEN,
  });

  return {
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    skills: job.skills,
    status: job.status,
    _count: { candidates: 0 },
  };
}

export async function ensureJobOpen(id: string) {
  await connectDb();

  const job = await JobOpening.findById(id);
  if (!job) {
    throw new HttpError('Job opening not found', 404);
  }
  if (job.status === JobStatus.CLOSED) {
    throw new HttpError('Cannot add candidates to a closed opening', 400);
  }
  return job;
}
