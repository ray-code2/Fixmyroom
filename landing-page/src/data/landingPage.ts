export const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Roles', href: '#roles' },
  { label: 'Finance', href: '#finance' },
  { label: 'Pricing', href: '#pricing' },
];

export const audiences = [
  'Boutique hotels',
  'Luxury villas',
  'Serviced apartments',
  'Vacation rental managers',
];

export const problems = [
  {
    label: 'Lost in chats',
    title: 'Repairs get buried in WhatsApp',
    description:
      'Problems are mentioned between guest requests and shift updates — then forgotten. There is no ticket, no owner, and no way to track if it was ever fixed.',
  },
  {
    label: 'No cost visibility',
    title: 'Nobody knows what repairs actually cost',
    description:
      'When technicians work informally, material and labour costs are never recorded. Monthly maintenance spend is a mystery until the invoice arrives.',
  },
  {
    label: 'Zero accountability',
    title: 'Managers cannot see who fixed what, or when',
    description:
      'Without a structured system, there is no audit trail. Managers cannot see who handled an issue, what status it is in, or whether it was resolved.',
  },
];

export const beforeFmrProblems = [
  'AC problem mentioned in group chat',
  'No assigned owner — who handles it?',
  'Status unknown — fixed or ignored?',
  'Costs tracked in a spreadsheet, or not at all',
  'No photo proof captured',
  'Manager follows up via WhatsApp days later',
];

export const withFmrOutcomes = [
  'Issue logged with room, photo, and category',
  'Technician assigned by manager',
  'Status visible to all: In Progress',
  'Technician logs material, labour, other costs',
  'Manager reviews and approves costs',
  'Issue closed with full audit trail',
];

export const howItWorksSteps = [
  {
    number: '01',
    title: 'Staff reports the issue',
    description:
      'Housekeeping or front desk selects the room, adds a short description, sets the category and priority, and uploads a photo. Done in under a minute.',
  },
  {
    number: '02',
    title: 'Manager reviews and assigns',
    description:
      'The new issue appears on the manager dashboard instantly. The manager reviews it, assigns a technician, and adjusts priority if needed.',
  },
  {
    number: '03',
    title: 'Technician works and logs costs',
    description:
      'The technician updates the issue status as they work, leaves notes for any blockers, and logs material, labour, and other costs when done.',
  },
  {
    number: '04',
    title: 'Manager approves and closes',
    description:
      'The manager reviews submitted costs, approves or rejects with a written reason, and closes the issue. The full history is saved permanently.',
  },
];

export const features = [
  'Instant issue reporting with photo upload',
  'Role-based dashboards for Staff, Manager, and Technician',
  'Issue status workflow: New → Assigned → In Progress → Waiting Parts → Completed',
  'Technician assignment by manager',
  'Notes on every issue from any team member',
  'Cost breakdown per issue: material, labour, and other',
  'Cost submit and manager approval workflow',
  'Finance dashboard with date-range filtering',
  'Estimated vs. actual cost comparison per issue',
  'Full audit trail — every change is logged with timestamp',
  'Team management: add members individually or bulk-upload via CSV',
  'Separate views tailored to each role',
];

export const fixHistoryBenefits = [
  'Every issue saved with room, category, priority, and assignee',
  'Status history shows when and who moved each issue forward',
  'Notes capture blockers, context, and handover details',
  'Costs are recorded and approved before the issue closes',
  'Managers filter issues by status, date, or assignee at any time',
];

export const fixHistoryRecords = [
  {
    room: 'Room 304',
    issue: 'AC not cooling — unusual clicking sound',
    category: 'HVAC',
    assignedTo: 'David — HVAC technician',
    status: 'Completed',
    proof: 'Costs approved',
    date: 'Today, 11:42 AM',
    urgency: 'High',
  },
  {
    room: 'Villa 12',
    issue: 'Bathroom sink leaking under cabinet',
    category: 'Plumbing',
    assignedTo: 'Rudi — Maintenance',
    status: 'In Progress',
    proof: 'Cost pending',
    date: 'Today, 10:18 AM',
    urgency: 'Medium',
  },
  {
    room: 'Room 208',
    issue: 'Guest room door lock jammed',
    category: 'Lock / Key',
    assignedTo: 'Eko — Internal team',
    status: 'Completed',
    proof: 'Costs approved',
    date: 'Yesterday, 4:35 PM',
    urgency: 'High',
  },
];

export const roles = [
  {
    role: 'Staff / Housekeeping',
    title: 'Report room issues in under a minute',
    description:
      'Select the room, describe the problem, set category and priority, and upload a photo. The manager is notified instantly. No WhatsApp message needed.',
  },
  {
    role: 'Manager',
    title: 'Full visibility and control from one dashboard',
    description:
      'See all open issues at a glance. Assign technicians, adjust priorities, track live status, approve or reject repair costs, and view monthly finance reports filtered by date.',
  },
  {
    role: 'Technician',
    title: "Focused queue — only what's assigned to you",
    description:
      'See only the issues assigned to you. Update status as you work, leave notes for blockers or waiting parts, then submit your cost breakdown for manager approval when done.',
  },
];

export const metrics = [
  { label: 'Open issues', value: '12', delta: '3 urgent' },
  { label: 'In progress', value: '5', delta: 'across 3 technicians' },
  { label: 'Pending cost approval', value: '4', delta: 'Rp 2.4M total' },
  { label: 'Completed this month', value: '31', delta: 'avg. 2.1 days' },
];

export const tickets = [
  {
    room: '304',
    category: 'HVAC',
    title: 'AC not cooling — clicking noise',
    status: 'Assigned',
    urgency: 'High',
    owner: 'David — HVAC technician',
  },
  {
    room: '118',
    category: 'Plumbing',
    title: 'Bathroom sink leaking',
    status: 'In progress',
    urgency: 'Medium',
    owner: 'Rudi — Maintenance',
  },
  {
    room: 'Villa 7',
    category: 'Electrical',
    title: 'Outdoor deck socket no power',
    status: 'Waiting parts',
    urgency: 'Low',
    owner: 'Eko — Internal team',
  },
];

export const suppliers = [
  {
    name: 'HVAC technician',
    category: 'HVAC',
    status: 'Preferred',
    response: 'Avg. 18 min',
    channel: 'WhatsApp',
  },
  {
    name: 'Plumber',
    category: 'Plumbing',
    status: 'Preferred',
    response: 'Avg. 24 min',
    channel: 'SMS',
  },
  {
    name: 'Electrician',
    category: 'Electrical',
    status: 'Backup',
    response: 'Avg. 31 min',
    channel: 'Email',
  },
  {
    name: 'Locksmith',
    category: 'Locks',
    status: 'Preferred',
    response: 'Avg. 15 min',
    channel: 'WhatsApp',
  },
  {
    name: 'General maintenance',
    category: 'General',
    status: 'Internal',
    response: 'On shift',
    channel: 'App queue',
  },
];

export const pricingPlans = [
  {
    name: 'Starter',
    audience: 'For villas and small properties',
    price: 'Coming Soon',
    description:
      'Issue reporting with photos, role-based dashboards, technician assignment, and status tracking for up to 20 rooms.',
  },
  {
    name: 'Hotel',
    audience: 'For boutique hotels',
    price: 'Contact Us',
    description:
      'Full multi-role workflow, cost breakdown with manager approval, finance dashboard, team management, and bulk CSV upload.',
    featured: true,
  },
  {
    name: 'Multi-Property',
    audience: 'For property managers',
    price: 'Contact Us',
    description:
      'Manage multiple properties under one account. Per-property team management, finance reports, and rollout support.',
  },
];

export const faqs = [
  {
    question: 'What roles does FMR support?',
    answer:
      'FMR has three roles: Staff (reports issues with photos), Manager (assigns technicians, reviews costs, and views finance reports), and Technician (works on issues and logs cost breakdowns). Each role has a dedicated dashboard tailored to their tasks.',
  },
  {
    question: 'How does cost tracking work?',
    answer:
      'When a repair is done, the technician logs costs split into material, labour, and other. They then submit the breakdown for manager review. The manager can approve or reject with a written reason. Approved costs appear in the finance dashboard.',
  },
  {
    question: 'What does the finance dashboard show?',
    answer:
      'The finance dashboard shows total estimated vs. actual costs, total approved spend, pending approvals count, and a list of all issues with cost data. You can filter by date range and by cost status (Draft, Pending, Approved, Rejected).',
  },
  {
    question: 'Can we add our own team members?',
    answer:
      'Yes. Managers can add staff, managers, or technicians individually by entering name, email, role, and phone. You can also bulk-upload your entire team by uploading a CSV file.',
  },
  {
    question: 'Does FMR replace our PMS or hotel software?',
    answer:
      'No. FMR is a focused maintenance tracker for room repairs. It handles issue reporting, technician assignment, status tracking, cost approval, and maintenance history — not reservations, billing, or guest check-in.',
  },
  {
    question: 'Can staff see each other\'s reported issues?',
    answer:
      'All team members can view issues for their property. Technicians see their assigned queue on their dashboard, managers see everything. Staff can see the list of all submitted issues and their current status.',
  },
];
