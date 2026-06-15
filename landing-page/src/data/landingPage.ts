export const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Fix history', href: '#fix-history' },
  { label: 'AI approval', href: '#ai-approval' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Pricing', href: '#pricing' }
];

export const audiences = ['Boutique hotels', 'Luxury villas', 'Glamping resorts', 'Vacation rentals'];

export const problems = [
  {
    label: 'Scattered reporting',
    title: 'Room issues disappear in WhatsApp chats',
    description:
      'Problems are mentioned between guest requests, shift updates, and vendor messages, so the repair trail gets buried fast.'
  },
  {
    label: 'Missing history',
    title: 'Managers forget what was already fixed',
    description:
      'Staff cannot easily check past repairs by room, asset, technician, or vendor when the next issue appears.'
  },
  {
    label: 'No proof trail',
    title: 'Before and after evidence is often missing',
    description:
      'Managers do not always know who handled the issue, when it was fixed, what vendor was contacted, or whether proof was uploaded.'
  }
];

export const beforeFmrProblems = [
  'AC problem mentioned in group chat',
  'No clear owner',
  'Vendor contacted manually',
  'Follow-ups scattered across messages',
  'No proof uploaded',
  'Hard to know if fixed'
];

export const withFmrOutcomes = [
  'Room 304 AC issue recorded',
  'AI classified as HVAC',
  'Manager approved dispatch',
  'Vendor contacted from supplier list',
  'Proof-of-fix uploaded',
  'History saved forever'
];

export const howItWorksSteps = [
  {
    number: '01',
    title: 'Staff captures photo and note',
    description: 'Housekeeping chooses the room, adds a short note, and uploads a before photo.'
  },
  {
    number: '02',
    title: 'AI classifies issue and urgency',
    description: 'FMR recommends category, urgency, summary, checklist, and next action.'
  },
  {
    number: '03',
    title: 'Manager approves dispatch',
    description: 'The manager edits, approves, assigns internally, or rejects the recommendation.'
  },
  {
    number: '04',
    title: 'Repair closes with proof',
    description: 'Technician or staff uploads after photo and notes before manager verification.'
  }
];

export const features = [
  'AI maintenance triage',
  'Manager approval before dispatch',
  'Vendor/contact recommendation',
  'WhatsApp/SMS/email repair request draft',
  'Technician queue',
  'Before/after proof-of-fix',
  'Room-level fix history',
  'Room status tracking',
  'Estimate vs. actual cost tracking per ticket',
  'Transparent monthly maintenance financial statement',
  'XLSX cost report — ready for your accountant'
];

export const fixHistoryBenefits = [
  'View complete maintenance history by room',
  'Track before-and-after repair proof',
  'See vendor and technician activity',
  'Reduce repeated room issues',
  'Replace messy WhatsApp follow-ups with structured records'
];

export const fixHistoryRecords = [
  {
    room: 'Room 304',
    issue: 'AC clicking, warm air',
    category: 'HVAC',
    assignedTo: 'Preferred HVAC technician',
    status: 'Fixed',
    proof: 'Proof uploaded',
    date: 'Today, 11:42 AM',
    urgency: 'High'
  },
  {
    room: 'Villa 12',
    issue: 'Bathroom leak',
    category: 'Plumbing',
    assignedTo: 'Island Plumbing Co.',
    status: 'Assigned',
    proof: 'Waiting for vendor',
    date: 'Today, 10:18 AM',
    urgency: 'Medium'
  },
  {
    room: 'Room 208',
    issue: 'Broken guest lock',
    category: 'Locksmith',
    assignedTo: 'Internal maintenance',
    status: 'Verified',
    proof: 'Completed',
    date: 'Yesterday, 4:35 PM',
    urgency: 'High'
  }
];

export const roles = [
  {
    role: 'Housekeeping',
    title: 'Snap photo, add note, submit',
    description:
      'Staff can report a broken AC, leak, light, lock, or furniture issue without filling out a long work order.'
  },
  {
    role: 'Manager',
    title: 'Review AI diagnosis and approve',
    description:
      'Managers keep final control over category, urgency, supplier choice, dispatch message, and ticket closure.'
  },
  {
    role: 'Technician/vendor',
    title: 'Receive task and upload proof',
    description:
      'Approved contacts receive the repair request, complete the work, then submit after photo, parts, and notes.'
  }
];

export const metrics = [
  { label: 'Open tickets', value: '18', delta: '4 urgent' },
  { label: 'Average fix time', value: '2.8h', delta: '31% faster' },
  { label: 'Rooms out of service', value: '3', delta: '1 checkout risk' },
  { label: 'Vendor response rate', value: '92%', delta: 'last 30 days' }
];

export const tickets = [
  {
    room: '304',
    category: 'HVAC',
    title: 'AC not cold, clicking sound',
    status: 'Awaiting approval',
    urgency: 'High',
    owner: 'Lin, Housekeeping'
  },
  {
    room: '118',
    category: 'Plumbing',
    title: 'Bathroom sink leak',
    status: 'Assigned',
    urgency: 'Medium',
    owner: 'Internal maintenance'
  },
  {
    room: 'Villa 7',
    category: 'Electrical',
    title: 'Outdoor deck light failed',
    status: 'In progress',
    urgency: 'Medium',
    owner: 'Preferred electrician'
  }
];

export const suppliers = [
  {
    name: 'HVAC technician',
    category: 'HVAC',
    status: 'Preferred',
    response: 'Avg. 18 min',
    channel: 'WhatsApp'
  },
  {
    name: 'Plumber',
    category: 'Plumbing',
    status: 'Preferred',
    response: 'Avg. 24 min',
    channel: 'SMS'
  },
  {
    name: 'Electrician',
    category: 'Electrical',
    status: 'Backup',
    response: 'Avg. 31 min',
    channel: 'Email'
  },
  {
    name: 'Locksmith',
    category: 'Locks',
    status: 'Preferred',
    response: 'Avg. 15 min',
    channel: 'WhatsApp'
  },
  {
    name: 'General maintenance',
    category: 'General',
    status: 'Internal',
    response: 'On shift',
    channel: 'App queue'
  }
];

export const pricingPlans = [
  {
    name: 'Starter',
    audience: 'For villas and small stays',
    price: 'Coming Soon',
    description: 'Photo reports, AI triage, approval queue, and basic supplier routing.'
  },
  {
    name: 'Hotel',
    audience: 'For boutique hotels',
    price: 'Contact Us',
    description: 'Multi-role workflow, room status tracking, vendor logs, and monthly insights.',
    featured: true
  },
  {
    name: 'Multi-Property',
    audience: 'For property managers',
    price: 'Contact Us',
    description: 'Portfolio view, property-level supplier lists, reporting, and rollout support.'
  }
];

export const faqs = [
  {
    question: 'Does FMR automatically contact vendors?',
    answer:
      'No. AI can recommend and draft, but manager approval is required before any external dispatch or purchase action.'
  },
  {
    question: 'Can we use our own suppliers?',
    answer:
      'Yes. The MVP uses each property approved supplier and technician list rather than a public marketplace.'
  },
  {
    question: 'Does this replace our PMS?',
    answer:
      'No. FMR focuses on maintenance triage, manager-approved dispatch, proof-of-fix, and maintenance history.'
  },
  {
    question: 'What happens if AI classification fails?',
    answer:
      'The ticket still exists. Managers can manually classify, edit, assign, and dispatch using the same approval workflow.'
  }
];
