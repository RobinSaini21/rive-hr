import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

type OfferLetterData = {
  candidateName: string;
  roleTitle: string;
  salaryCurrency: string;
  salaryAmount: number;
  startDate: Date;
  managerName: string;
  location: string;
};

type NdaData = {
  candidateName: string;
  date: Date;
};

export async function generateOfferLetter(data: OfferLetterData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 72, size: 'LETTER' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).fillColor('#0f2744').text('ROVE', { align: 'center' });
    doc
      .moveDown(0.3)
      .fontSize(10)
      .fillColor('#64748b')
      .text('Confidential Employment Offer', { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(11).fillColor('#0f172a').text(format(data.startDate, 'MMMM d, yyyy'));
    doc.moveDown(1.5);
    doc.text(`Dear ${data.candidateName},`);
    doc.moveDown();
    doc.text(
      `ROVE is pleased to offer you the position of ${data.roleTitle}. We were impressed by your experience and believe you will make a meaningful contribution to our team.`,
      { align: 'justify' },
    );
    doc.moveDown();
    doc.text('Offer details:', { underline: true });
    doc.moveDown(0.5);
    doc.list([
      `Position: ${data.roleTitle}`,
      `Compensation: ${data.salaryCurrency} ${data.salaryAmount.toLocaleString()} per year`,
      `Start date: ${format(data.startDate, 'MMMM d, yyyy')}`,
      `Reporting manager: ${data.managerName}`,
      `Work location: ${data.location}`,
    ]);
    doc.moveDown();
    doc.text(
      'This offer is contingent upon satisfactory completion of background checks and proof of eligibility to work.',
      { align: 'justify' },
    );
    doc.moveDown();
    doc.text(
      'Please sign and return this letter to indicate your acceptance. We look forward to welcoming you to ROVE.',
      { align: 'justify' },
    );
    doc.moveDown(3);
    doc.text('Sincerely,');
    doc.moveDown(2);
    doc.text('_________________________');
    doc.text('ROVE People Operations');
    doc.end();
  });
}

export async function generateNda(data: NdaData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 72, size: 'LETTER' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).fillColor('#0f2744').text('ROVE', { align: 'center' });
    doc
      .moveDown(0.3)
      .fontSize(12)
      .fillColor('#0f172a')
      .text('Mutual Non-Disclosure Agreement', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(11).text(`Effective date: ${format(data.date, 'MMMM d, yyyy')}`);
    doc.moveDown();
    doc.text(
      `This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between ROVE ("Company") and ${data.candidateName} ("Recipient").`,
      { align: 'justify' },
    );
    doc.moveDown();
    doc.text('Recipient agrees to hold all non-public Company information in strict confidence.');
    doc.moveDown(3);
    doc.text('ROVE');
    doc.moveDown(2);
    doc.text('_________________________');
    doc.text(data.candidateName);
    doc.end();
  });
}
