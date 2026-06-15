import { roles } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';

export function RoleBasedWorkflowSection() {
  return (
    <SectionContainer
      id="roles"
      tone="ivory"
      eyebrow="Role-based workflow"
      title="Each team member sees the work they need to do."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {roles.map((role) => (
          <article key={role.role} className="rounded-3xl border border-[#eadfd2] bg-white p-6">
            <p className="text-xs font-black uppercase text-[#8a5a2f]">{role.role}</p>
            <h3 className="mt-4 text-2xl font-black text-[#1c1714]">{role.title}</h3>
            <p className="mt-4 text-[15px] leading-7 text-[#6b5c53]">{role.description}</p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
