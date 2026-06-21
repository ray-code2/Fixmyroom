import { roles } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';

const ROLE_ICONS: Record<string, string> = {
  'Staff / Housekeeping': '🛎',
  'Manager': '🧑‍💼',
  'Technician': '🔧',
};

const ROLE_HIGHLIGHTS: Record<string, string[]> = {
  'Staff / Housekeeping': [
    'Choose the room from a list',
    'Set category: HVAC, Plumbing, Electrical…',
    'Upload a photo at report time',
    'Track the status of your own reports',
  ],
  'Manager': [
    'Dashboard with open, urgent, and in-progress counts',
    'Assign any issue to a specific technician',
    'Review and approve or reject cost submissions',
    'View finance summary filtered by date',
  ],
  'Technician': [
    'See only the issues assigned to you',
    'Update status as you work through the repair',
    'Add notes for blockers or waiting parts',
    'Submit cost breakdown for manager approval',
  ],
};

export function RoleBasedWorkflowSection() {
  return (
    <SectionContainer
      id="roles"
      tone="ivory"
      eyebrow="Role-based workflow"
      title="Every team member sees exactly what they need to do."
      intro="Staff, managers, and technicians each get a purpose-built dashboard — no clutter, no confusion."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {roles.map((role) => {
          const highlights = ROLE_HIGHLIGHTS[role.role] ?? [];
          const icon = ROLE_ICONS[role.role] ?? '👤';
          return (
            <article
              key={role.role}
              className="flex flex-col rounded-3xl border border-[#eadfd2] bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eadf] text-xl">
                  {icon}
                </span>
                <p className="text-xs font-black uppercase text-[#8a5a2f]">{role.role}</p>
              </div>
              <h3 className="mt-4 text-xl font-black text-[#1c1714]">{role.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#6b5c53]">{role.description}</p>
              <ul className="mt-5 grid gap-2 border-t border-[#eadfd2] pt-5">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#4b2e1f]" aria-hidden="true" />
                    <span className="text-sm text-[#4d3a31]">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </SectionContainer>
  );
}
