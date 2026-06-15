import { suppliers } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';
import { VendorCard } from '../previews/VendorCard';

export function SupplierDispatchSection() {
  return (
    <SectionContainer
      id="suppliers"
      tone="ivory"
      eyebrow="Supplier dispatch"
      title="Use each hotel's approved contact list first."
      intro="The MVP recommends from the property's own suppliers and technicians, not a public marketplace."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {suppliers.map((supplier) => (
          <VendorCard key={supplier.name} {...supplier} />
        ))}
      </div>
    </SectionContainer>
  );
}
