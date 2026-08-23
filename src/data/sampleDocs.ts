import { SampleDocument } from '../types';

// Helper to create an authentic government notice image data URL
function createSampleNoticeImage(title: string, dept: string, isUrgent: boolean, isBlurry: boolean = false): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1050;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - realistic slightly off-white archival official paper
  ctx.fillStyle = isBlurry ? '#94a3b8' : '#fcfbf7';
  ctx.fillRect(0, 0, 800, 1050);

  if (isBlurry) {
    // Simulate dark, heavily blurred, unreadable camera photo
    ctx.filter = 'blur(16px) contrast(0.6) brightness(0.6)';
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, 50, 700, 950);
    ctx.fillStyle = '#334155';
    for (let i = 100; i < 900; i += 30) {
      ctx.fillRect(100, i, 500 + (i % 80), 12);
    }
    return canvas.toDataURL('image/jpeg', 0.7);
  }

  // Authentic Document Borders and Watermark
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 740, 990);
  ctx.strokeRect(35, 35, 730, 980);

  // Emblem / Seal placeholder
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.arc(400, 90, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOVT', 400, 96);

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 19px serif';
  ctx.fillText('GOVERNMENT OF KARNATAKA', 400, 150);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.fillText(dept.toUpperCase(), 400, 175);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('REF NO: BBMP/REV/2026/WN-112/DEMAND-8402 | DATE: 18-08-2026', 400, 200);

  // Divider
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 215);
  ctx.lineTo(740, 215);
  ctx.stroke();

  // Subject line
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = isUrgent ? '#991b1b' : '#0f172a';
  ctx.fillText(`SUBJECT: ${title.toUpperCase()}`, 60, 245);

  // Body text
  ctx.font = '13px serif';
  ctx.fillStyle = '#1e293b';
  const lines = [
    'TO: PROPERTY OWNER / OCCUPIER, PID NO: 088-W0112-42, INDIRANAGAR, BENGALURU.',
    '',
    '1. Upon comprehensive GIS satellite assessment and spot measurement conducted under Section',
    '   108A(3) of the Karnataka Municipal Corporations Act, a significant area under-reporting',
    '   discrepancy (740 sq.ft plinth difference) has been established for assessment years 2023-2026.',
    '',
    '2. You are hereby assessed for differential property tax amounting to ₹48,650/- along with accrued',
    '   statutory interest penalty of ₹5,550/- totaling ₹54,200/- (Rupees Fifty Four Thousand Two Hundred).',
    '',
    '3. TAKE NOTICE that the said sum MUST be paid within SEVEN (7) DAYS from the date of this notice',
    '   through the BBMP SAS online citizen portal (bbmp.gov.in) or at the Ward 112 Revenue Desk.',
    '',
    '4. FAILURE TO COMPLY will result in institution of Warrant of Distress and attachment of premises',
    '   under Section 112B without further opportunity.',
    '',
    '5. Appeals or Form-V objections must be filed before the Joint Commissioner on or before 25-08-2026.'
  ];

  let y = 280;
  for (const line of lines) {
    ctx.fillText(line, 60, y);
    y += 24;
  }

  // Official Stamp and Signature Box
  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 2;
  ctx.strokeRect(520, 830, 200, 120);

  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.textAlign = 'center';
  ctx.fillText('OFFICIAL SEAL & STAMP', 620, 855);

  ctx.font = 'italic 16px cursive';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('A. R. Sharma', 620, 895);

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Assistant Revenue Officer', 620, 920);
  ctx.fillText('BBMP East Division, Bengaluru', 620, 935);

  return canvas.toDataURL('image/jpeg', 0.85);
}

// Pre-create sample image URLs (lazily on first access if in browser)
let cachedNoticeImageUrl: string | null = null;
let cachedBlurryImageUrl: string | null = null;

export function getSampleNoticeImage(): string {
  if (typeof window === 'undefined') return '';
  if (!cachedNoticeImageUrl) {
    cachedNoticeImageUrl = createSampleNoticeImage(
      'Demand for Differential Tax & Penalty',
      'Bruhat Bengaluru Mahanagara Palike (Revenue Department)',
      true,
      false
    );
  }
  return cachedNoticeImageUrl;
}

export function getSampleBlurryImage(): string {
  if (typeof window === 'undefined') return '';
  if (!cachedBlurryImageUrl) {
    cachedBlurryImageUrl = createSampleNoticeImage(
      'Blurry Document Photo',
      'Unreadable Sample',
      false,
      true
    );
  }
  return cachedBlurryImageUrl;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'tax-rectification-notice',
    title: 'Municipal Property Tax Demand Notice',
    category: 'Urgent Municipal Notice',
    urgencyHint: 'RED',
    type: 'text',
    badgeNote: 'Deadline in 7 Days (Penalty / Attachment)',
    description: 'Strict 7-day municipal property tax demand notice under Section 108A(3) with distress warrant threat.',
    text: `BRUHAT BENGALURU MAHANAGARA PALIKE (BBMP)
REVENUE DEPARTMENT - RECTIFICATION & DEMAND NOTICE UNDER SECTION 108A(3)
Notice Ref No: BBMP/REV/EAST/2026/WN-112-9842
Date of Issue: 18th August 2026

To: Property Owner / Occupier (PID No: 088-W0112-42)
Address: Site No. 45, 3rd Cross, Indiranagar, Bengaluru - 560038

Subject: Demand for Differential Self-Assessment Property Tax & Re-measurement Penalty for Assessment Years 2023-2026.

1. Whereas, upon digital satellite GIS mapping and physical re-inspection carried out under the Karnataka Municipal Corporations Act, 1976 (amended), a discrepancy has been established between the declared built-up area (2,150 sq.ft) and the actual physical constructed plinth area (2,890 sq.ft) on the aforementioned premises.

2. Consequently, you are hereby assessed for differential property tax amounting to ₹48,650/- along with accrued penalty interest at 2% per month calculated under Section 112B.

3. TAKE NOTICE that the total outstanding sum of ₹54,200/- (Rupees Fifty Four Thousand Two Hundred only) must be remitted into the BBMP Revenue Escrow Account or cleared via the BBMP SAS Online Portal within SEVEN (7) DAYS of receipt of this notice, failing which:
   (a) A warrant of distress and attachment of movable/immovable assets shall be instituted without further notification.
   (b) Essential utility connections (BWSSB water supply) may be recommended for temporary suspension under Rule 14.

4. If you seek to file an appeal or produce sanctioned structural plan records, you MUST submit Form-V objection statement before the Joint Commissioner (Revenue) at the Ward 112 Zonal Office on or before 25th August 2026 along with proof of occupancy and original khata certificate.

By Order of the Authorized Officer,
Assistant Revenue Officer (ARO), BBMP East Division.`
  },
  {
    id: 'scanned-photo-notice',
    title: 'Scanned Document Photo (BBMP Demand Notice)',
    category: 'Image / Photo Upload',
    urgencyHint: 'RED',
    type: 'image',
    badgeNote: 'Scanned Photo with Seal & Stamp',
    description: 'High-resolution photo of an official stamped government notice to test Gemini vision/OCR.',
    imageFileName: 'BBMP_Notice_Demand_2026.jpg',
  },
  {
    id: 'pension-biometric-verification',
    title: 'Pension Biometric Verification (Jeevan Pramaan)',
    category: 'Social Welfare Advisory',
    urgencyHint: 'YELLOW',
    type: 'text',
    badgeNote: 'Deadline in 25 Days (Upcoming Suspension)',
    description: 'Mandatory annual digital life certificate biometric re-authentication for pensioners.',
    text: `DIRECTORATE OF SOCIAL SECURITY AND PENSIONS
GOVERNMENT OF KARNATAKA / MINISTRY OF SOCIAL JUSTICE
Circular No: DSSP/PEN-VERIFY/2026-Q3/4011
Date: 10th August 2026

To: All Beneficiaries under Old Age Pension (Sandhya Suraksha), Widow Pension, and Disability Welfare Schemes.

Subject: Mandatory Annual Digital Life Certificate (DLC) Biometric Re-Authentication for Financial Year 2026-27.

1. In accordance with DBT (Direct Benefit Transfer) Aadhaar Seeding guidelines issued by the Department of Financial Services, all enrolled pension beneficiaries are required to complete mandatory annual biometric or facial Iris/Fingerprint authentication for continuation of monthly stipend credits.

2. TIMELINE: The physical and digital verification window is operational from 1st August 2026 until 15th September 2026 (35-day window). Beneficiaries who fail to authenticate by 15th September 2026 will face temporary disbursement freeze starting October 2026.

3. PROCEDURE TO COMPLY:
   (a) Visit any nearest Karnataka-One, Bangalore-One, or Grama-One Citizen Service Center with original Aadhaar Card, Pension Order Number (PPO), and linked mobile phone.
   (b) Alternatively, use the Jeevan Pramaan Android App using mobile RD facial authentication at home.
   (c) Bedridden or senior citizens above 80 years may request door-step assisted biometric capture by notifying the local Village Administrative Officer (VAO) / Ward Revenue Inspector.

4. No fee is payable for biometric verification at government centers. Report any unauthorized solicitation of fees to the Toll-Free Citizen Helpline 1902.

Joint Director (Pensions),
Social Welfare & Pension Administration.`
  },
  {
    id: 'water-pipe-maintenance',
    title: 'Cauvery Water Supply Pipeline Advisory',
    category: 'Public Civic Bulletin',
    urgencyHint: 'GREEN',
    type: 'text',
    badgeNote: 'Informational Only (Scheduled Works)',
    description: 'Public utility notice regarding scheduled routine maintenance and pressure regulation.',
    text: `BANGALORE WATER SUPPLY AND SEWERAGE BOARD (BWSSB)
PUBLIC INFORMATION BULLETIN & SUPPLY SCHEDULE NOTIFICATION
Notification Ref: BWSSB/MAINT/CAUVERY-V/2026/08

Date of Bulletin: 20th August 2026
Target Audience: Residents of South, East, and South-East Municipal Sectors.

Subject: Routine Pipeline Interconnection & Preventive Scouring Works for Cauvery Stage V Feeder Main Line.

1. Notice is hereby conveyed to the general public that BWSSB engineering teams will undertake planned preventive maintenance and integration of smart pressure flow sensors along the main southern feeder conduit from 28th August 2026 (06:00 AM) to 29th August 2026 (06:00 PM).

2. IMPACT ON CONSUMERS:
   - Piped water supply will remain regulated with low pressure during the aforementioned 36-hour operational window.
   - Piped water distribution will resume normal volumetric delivery on Sunday, 30th August 2026 morning.

3. ADVISORY GUIDELINES FOR CITIZENS:
   - Consumers are advised to store adequate water in overhead and sump reservoirs prior to 28th August 2026.
   - For emergency drinking water tanker support during the maintenance period, residents may register a dispatch request on the BWSSB Sahayavani App or dial the 24x7 control room at 080-22945100.
   - Commercial establishments with high-capacity requirements are advised to manage internal reserves accordingly.

This notification is purely informational for public preparedness and requires no fee, penalty, or formal administrative submission.

Issued in public interest,
Chief Public Relations Officer, BWSSB.`
  },
  {
    id: 'kannada-regional-notice',
    title: 'Regional Kannada Municipal Notice (ಕನ್ನಡ ಪ್ರಕಟಣೆ)',
    category: 'Multilingual Notice',
    urgencyHint: 'YELLOW',
    type: 'text',
    badgeNote: 'Kannada Source → Plain English Translation',
    description: 'Original municipal notice in Kannada to test automated source language detection and translation.',
    text: `ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (ಬಿಬಿಎಂಪಿ)
ಕಂದಾಯ ವಿಭಾಗ - ವ್ಯಾಪಾರ ಪರವಾನಗಿ ನವೀಕರಣ ಪ್ರಕಟಣೆ ೨೦೨೬-೨೭
ಸಂಖ್ಯೆ: ಬಿಬಿಎಂಪಿ/ವ್ಯಾ-ಪ/೨೦೨೬/೫೪೩ ದಿನಾಂಕ: ೧೨ ಆಗಸ್ಟ್ ೨೦೨೬

ಎಲ್ಲಾ ವಾಣಿಜ್ಯ ಮಳಿಗೆಗಳ ಮಾಲೀಕರಿಗೆ ಹಾಗೂ ವ್ಯಾಪಾರಿಗಳಿಗೆ ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆ:

ವಿಷಯ: ೨೦೨೬-೨೭ ನೇ ಸಾಲಿನ ವಾರ್ಷಿಕ ವ್ಯಾಪಾರ ಪರವಾನಗಿ (Trade License) ಕಡ್ಡಾಯ ನವೀಕರಣ ಮತ್ತು ಕಸ ವಿಲೇವಾರಿ ಶುಲ್ಕ ಪಾವತಿ.

೧. ಬಿಬಿಎಂಪಿ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿರುವ ಎಲ್ಲಾ ವಾಣಿಜ್ಯ ಸಂಸ್ಥೆಗಳು, ಅಂಗಡಿಗಳು ಮತ್ತು ಹೋಟೆಲ್ ಮಾಲೀಕರು ತಮ್ಮ ವಾರ್ಷಿಕ ವ್ಯಾಪಾರ ಪರವಾನಗಿಯನ್ನು ದಿನಾಂಕ ೩೧ ಆಗಸ್ಟ್ ೨೦೨೬ ರೊಳಗೆ ನವೀಕರಿಸಿಕೊಳ್ಳತಕ್ಕದ್ದು.

೨. ನಿಗದಿತ ದಿನಾಂಕದೊಳಗೆ ನವೀಕರಿಸದಿದ್ದಲ್ಲಿ ದಿನಕ್ಕೆ ಶೇ. ೨ ರಂತೆ ದಂಡ ಶುಲ್ಕ ವಿಧಿಸಲಾಗುವುದು ಹಾಗೂ ಪರವಾನಗಿ ರದ್ದತಿಗೆ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗುವುದು.

೩. ನವೀಕರಣ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ bbmp.karnataka.gov.in ಮೂಲಕ ಅಥವಾ ಸಮೀಪದ ಬೆಂಗಳೂರು-ಒನ್ ಕೇಂದ್ರದಲ್ಲಿ ಪೂರ್ಣಗೊಳಿಸಬಹುದು.

ಕಂದಾಯ ಅಧಿಕಾರಿ, ಬಿಬಿಎಂಪಿ.`
  },
  {
    id: 'blurry-unreadable-sample',
    title: 'Unclear / Blurry Photo Sample',
    category: 'Legibility Test Sample',
    urgencyHint: 'UNREADABLE',
    type: 'image',
    badgeNote: 'Tests Unreadable Warning State',
    description: 'A dark, out-of-focus phone camera photo to test that AI does not hallucinate and prompts for a clearer upload.',
    imageFileName: 'Blurry_Dark_Photo_Sample.jpg',
  }
];
