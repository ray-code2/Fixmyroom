export const workflowSteps = [
  {
    title: 'Snap the issue',
    body: 'Staff take a photo, choose the room, and add one short note or voice-to-text description.'
  },
  {
    title: 'AI triages the report',
    body: 'FMR predicts the likely category, urgency, summary, recommended action, and diagnostic checklist.'
  },
  {
    title: 'Manager approves',
    body: 'The manager confirms the next step, edits the draft, assigns internally, or rejects the recommendation.'
  },
  {
    title: 'Dispatch with context',
    body: 'The approved supplier or technician receives a clean request with room, photo, urgency, and summary.'
  },
  {
    title: 'Verify the fix',
    body: 'After photos and technician notes move the ticket to manager verification before closure.'
  }
];

export const problemCards = [
  {
    metric: 'Chat noise',
    title: 'Maintenance reports get buried',
    body: 'Room issues usually start with housekeeping, but the details often land in WhatsApp groups, voice notes, or shift handovers.'
  },
  {
    metric: 'Slow handoff',
    title: 'The wrong person gets pinged',
    body: 'Teams lose time deciding whether an issue is HVAC, plumbing, electrical, internet, furniture, or an internal task.'
  },
  {
    metric: 'No record',
    title: 'Proof and accountability disappear',
    body: 'Before photos, after photos, vendor messages, and approval timestamps are rarely kept in one operational trail.'
  }
];

export const useCases = [
  'AC clicking or blowing warm air',
  'Leaking bathroom fixture',
  'Flickering light or electrical fault',
  'Door lock or keycard issue',
  'Weak WiFi or router failure',
  'Furniture, curtain, or wall damage',
  'Pool pump or outdoor lighting issue',
  'Glamping tent zip, deck, or fan repair'
];

export const features = [
  {
    title: 'Photo-first reporting',
    body: 'Staff can report problems quickly without long forms or technical wording.'
  },
  {
    title: 'AI issue classification',
    body: 'Managers get a suggested category, urgency, summary, and diagnostic checklist.'
  },
  {
    title: 'Approval workflow',
    body: 'AI helps prepare the next step, but managers stay in control before dispatch or purchase action.'
  },
  {
    title: 'Supplier contact routing',
    body: 'Recommend the right approved contact by category using each property owner-approved list.'
  },
  {
    title: 'Proof of fix',
    body: 'Before and after photos create accountability and reduce repeated disputes.'
  },
  {
    title: 'Maintenance history',
    body: 'Track recurring problems by room, category, assignee, vendor, and time to resolution.'
  }
];

export const faqs = [
  {
    question: 'Does FMR automatically call vendors or buy parts?',
    answer:
      'No. The MVP keeps manager approval before any external dispatch, vendor contact, or purchase action.'
  },
  {
    question: 'Can hotels use their own repair contacts?',
    answer:
      'Yes. Phase 1 of the product uses each hotel, villa, or resort operator approved supplier list, not a public marketplace.'
  },
  {
    question: 'Does FMR replace our PMS?',
    answer:
      'No. FMR focuses on maintenance triage, dispatch approval, proof-of-fix, and maintenance history. PMS integration can come later.'
  },
  {
    question: 'What happens if AI triage fails?',
    answer:
      'The ticket still exists. FMR shows a clear fallback state and lets the manager classify, assign, or dispatch manually.'
  },
  {
    question: 'Can staff use it with weak internet?',
    answer:
      'The MVP plan includes local draft saving for staff reports. Full offline sync can be added after pilot validation.'
  }
];

export const aiTriage = {
  category: 'HVAC',
  urgency: 'HIGH',
  confidence: 'Recommendation, manager review required',
  room: 'Room 304',
  status: 'Awaiting manager approval',
  summary:
    'AC system issue in Room 304. Unit is clicking and blowing warm air. Immediate maintenance inspection recommended before guest check-in.',
  recommendedAction:
    'Contact preferred HVAC technician or assign internal maintenance if available.',
  checklist: [
    'Check power supply and breaker status',
    'Inspect filter and airflow obstruction',
    'Verify compressor and fan operation',
    'Check for unusual noise source'
  ]
};
