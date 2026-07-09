import { config } from 'dotenv';

config({ path: '.env.local' });
config();
import * as bcrypt from 'bcrypt';
import { addDays, subDays } from 'date-fns';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import { connectDb } from '../src/lib/server/db';
import {
  CandidateStatus,
  DocumentType,
  InterviewStatus,
  InterviewType,
} from '../src/lib/server/enums';
import * as files from '../src/lib/server/files';
import * as gridfs from '../src/lib/server/gridfs';
import {
  Candidate,
  Interview,
  JobOpening,
  StoredDocument,
  TimelineEvent,
  User,
} from '../src/lib/server/models';

async function createPdf(title: string, lines: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(18).text(title);
    doc.moveDown();
    lines.forEach((line) => doc.fontSize(11).text(line));
    doc.end();
  });
}

async function saveDocument(
  candidateId: mongoose.Types.ObjectId,
  type: DocumentType,
  fileName: string,
  buffer: Buffer,
) {
  await files.saveBuffer(
    candidateId.toString(),
    type,
    buffer,
    fileName,
    'application/pdf',
  );
}

async function main() {
  await connectDb();

  await Promise.all([
    TimelineEvent.deleteMany({}),
    Interview.deleteMany({}),
    Candidate.deleteMany({}),
    JobOpening.deleteMany({}),
    User.deleteMany({}),
  ]);

  await gridfs.dropBucket();
  await StoredDocument.deleteMany({});

  const passwordHash = await bcrypt.hash('rovehire2026', 10);
  await User.create({
    email: 'hr@rove.com',
    passwordHash,
    name: 'ROVE HR Admin',
  });

  const jobs = await JobOpening.insertMany([
    {
      title: 'Senior Full-Stack Engineer',
      description:
        "Build and scale ROVE's internal platforms and customer-facing products. You will work across Next.js and MongoDB.",
      skills: ['TypeScript', 'React', 'Node.js', 'MongoDB'],
      status: 'OPEN',
    },
    {
      title: 'Product Designer',
      description:
        'Own end-to-end design for ROVE Hire and partner tools. Strong systems thinking and polish required.',
      skills: ['Figma', 'UX Research', 'Design Systems'],
      status: 'OPEN',
    },
    {
      title: 'People Operations Specialist',
      description:
        'Support hiring, onboarding, and employee lifecycle programs for a growing global team.',
      skills: ['HRIS', 'Onboarding', 'Compliance'],
      status: 'CLOSED',
    },
  ]);

  const [engineerJob, designerJob, peopleJob] = jobs;

  const appliedCandidate = await Candidate.create({
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    status: CandidateStatus.APPLIED,
    jobOpeningId: engineerJob._id,
    magicLinkToken: 'seed-token-applied',
    magicLinkExpiresAt: addDays(new Date(), 14),
    magicLinkUsed: false,
  });
  await TimelineEvent.create({
    candidateId: appliedCandidate._id,
    type: 'APPLIED',
    title: 'Application received',
    description: 'Resume uploaded and candidate added to pipeline.',
  });
  await saveDocument(
    appliedCandidate._id,
    DocumentType.RESUME,
    'Alex-Rivera-Resume.pdf',
    await createPdf('Alex Rivera — Resume', [
      'Full-stack engineer with 6 years experience.',
      'Skills: TypeScript, React, Node.js, AWS',
    ]),
  );

  const formCandidate = await Candidate.create({
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    status: CandidateStatus.FORM_SUBMITTED,
    jobOpeningId: designerJob._id,
    phone: '+1 (415) 555-0182',
    location: 'San Francisco, CA',
    currentRole: 'Product Designer at Lumina',
    noticePeriod: '4 weeks',
    salaryExpectation: '$145,000',
    linkedinUrl: 'https://linkedin.com/in/jordanlee',
    magicLinkToken: 'seed-token-used',
    magicLinkExpiresAt: addDays(new Date(), 10),
    magicLinkUsed: true,
  });
  await TimelineEvent.insertMany([
    {
      candidateId: formCandidate._id,
      type: 'APPLIED',
      title: 'Application received',
      description: 'Resume uploaded.',
    },
    {
      candidateId: formCandidate._id,
      type: 'FORM_SUBMITTED',
      title: 'Application form submitted',
      description: 'Candidate completed application details.',
    },
  ]);
  await saveDocument(
    formCandidate._id,
    DocumentType.RESUME,
    'Jordan-Lee-Resume.pdf',
    await createPdf('Jordan Lee — Resume', [
      'Product designer focused on enterprise workflows.',
    ]),
  );

  const interviewCandidate = await Candidate.create({
    name: 'Samira Khan',
    email: 'samira.khan@example.com',
    status: CandidateStatus.INTERVIEW_SCHEDULED,
    jobOpeningId: engineerJob._id,
    phone: '+1 (512) 555-0144',
    location: 'Austin, TX',
    currentRole: 'Software Engineer at Northwind',
    noticePeriod: '2 weeks',
    salaryExpectation: '$165,000',
    linkedinUrl: 'https://linkedin.com/in/samirakhan',
    magicLinkUsed: true,
  });
  await TimelineEvent.insertMany([
    {
      candidateId: interviewCandidate._id,
      type: 'APPLIED',
      title: 'Application received',
      description: 'Resume uploaded.',
    },
    {
      candidateId: interviewCandidate._id,
      type: 'FORM_SUBMITTED',
      title: 'Application form submitted',
      description: 'Candidate completed application details.',
    },
    {
      candidateId: interviewCandidate._id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Technical interview scheduled',
      description: 'With Dana Brooks on upcoming date.',
    },
  ]);
  await saveDocument(
    interviewCandidate._id,
    DocumentType.RESUME,
    'Samira-Khan-Resume.pdf',
    await createPdf('Samira Khan — Resume', [
      'Backend-leaning full-stack engineer.',
    ]),
  );

  const completedInterview = await Interview.create({
    candidateId: interviewCandidate._id,
    type: InterviewType.TECHNICAL,
    scheduledAt: addDays(new Date(), 2),
    interviewerName: 'Dana Brooks',
    notes: 'Focus on system design and API patterns.',
    status: InterviewStatus.COMPLETED,
    feedbackRecommendation: 'HIRE',
    feedbackNote: 'Strong communication and solid architecture instincts.',
  });

  await TimelineEvent.create({
    candidateId: interviewCandidate._id,
    type: 'INTERVIEW_FEEDBACK',
    title: 'Interview feedback recorded',
    description:
      'HIRE: Strong communication and solid architecture instincts.',
  });

  const offerCandidate = await Candidate.create({
    name: 'Chris Morgan',
    email: 'chris.morgan@example.com',
    status: CandidateStatus.OFFER_SENT,
    jobOpeningId: engineerJob._id,
    phone: '+1 (206) 555-0199',
    location: 'Seattle, WA',
    currentRole: 'Senior Engineer at Atlas',
    noticePeriod: '3 weeks',
    salaryExpectation: '$175,000',
    linkedinUrl: 'https://linkedin.com/in/chrismorgan',
    magicLinkUsed: true,
    offerRoleTitle: 'Senior Full-Stack Engineer',
    offerSalaryCurrency: 'USD',
    offerSalaryAmount: 172000,
    offerStartDate: addDays(new Date(), 30),
    offerManager: 'Taylor Reed',
    offerLocation: 'Seattle, WA (Hybrid)',
  });
  await TimelineEvent.insertMany([
    {
      candidateId: offerCandidate._id,
      type: 'APPLIED',
      title: 'Application received',
      description: 'Resume uploaded.',
    },
    {
      candidateId: offerCandidate._id,
      type: 'FORM_SUBMITTED',
      title: 'Application form submitted',
      description: 'Candidate completed application details.',
    },
    {
      candidateId: offerCandidate._id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Screening interview scheduled',
      description: 'Completed successfully.',
    },
    {
      candidateId: offerCandidate._id,
      type: 'OFFER_SENT',
      title: 'Offer documents generated',
      description: 'Offer letter and NDA prepared.',
    },
  ]);
  await saveDocument(
    offerCandidate._id,
    DocumentType.RESUME,
    'Chris-Morgan-Resume.pdf',
    await createPdf('Chris Morgan — Resume', [
      'Senior engineer with platform experience.',
    ]),
  );
  await saveDocument(
    offerCandidate._id,
    DocumentType.OFFER_LETTER,
    'Offer-Letter-Chris-Morgan.pdf',
    await createPdf('ROVE Offer Letter', [
      'Dear Chris Morgan,',
      'We are pleased to offer you the Senior Full-Stack Engineer role.',
      'Salary: USD 172,000',
    ]),
  );
  await saveDocument(
    offerCandidate._id,
    DocumentType.NDA,
    'NDA-Chris-Morgan.pdf',
    await createPdf('ROVE NDA', [
      'Mutual Non-Disclosure Agreement for Chris Morgan.',
    ]),
  );
  await Interview.create({
    candidateId: offerCandidate._id,
    type: InterviewType.SCREENING,
    scheduledAt: subDays(new Date(), 5),
    interviewerName: 'Taylor Reed',
    status: InterviewStatus.COMPLETED,
    feedbackRecommendation: 'HIRE',
    feedbackNote: 'Excellent culture fit.',
  });

  const rejectedCandidate = await Candidate.create({
    name: 'Taylor Nguyen',
    email: 'taylor.nguyen@example.com',
    status: CandidateStatus.REJECTED,
    jobOpeningId: peopleJob._id,
    phone: '+1 (303) 555-0110',
    location: 'Denver, CO',
    currentRole: 'HR Coordinator',
    noticePeriod: 'Immediate',
    salaryExpectation: '$78,000',
    rejectionReason:
      'Role requires 3+ years HRIS implementation experience.',
    magicLinkUsed: true,
  });
  await TimelineEvent.insertMany([
    {
      candidateId: rejectedCandidate._id,
      type: 'APPLIED',
      title: 'Application received',
      description: 'Resume uploaded.',
    },
    {
      candidateId: rejectedCandidate._id,
      type: 'FORM_SUBMITTED',
      title: 'Application form submitted',
      description: 'Candidate completed application details.',
    },
    {
      candidateId: rejectedCandidate._id,
      type: 'REJECTED',
      title: 'Candidate rejected',
      description:
        'Role requires 3+ years HRIS implementation experience.',
    },
  ]);
  await saveDocument(
    rejectedCandidate._id,
    DocumentType.RESUME,
    'Taylor-Nguyen-Resume.pdf',
    await createPdf('Taylor Nguyen — Resume', [
      'People operations generalist.',
    ]),
  );

  console.log('Seed complete');
  console.log('HR login: hr@rove.com / rovehire2026');
  console.log('Magic link (Applied): /apply/seed-token-applied');
  console.log('Interview candidate:', interviewCandidate._id.toString());
  console.log('Completed interview:', completedInterview._id.toString());
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
