import { useEffect, useState } from 'react';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { AIApprovalFlowSection } from './components/sections/AIApprovalFlowSection';
import { CTASection } from './components/sections/CTASection';
import { DashboardPreviewSection } from './components/sections/DashboardPreviewSection';
import { FAQSection } from './components/sections/FAQSection';
import { FeatureSection } from './components/sections/FeatureSection';
import { FixHistorySection } from './components/sections/FixHistorySection';
import { HeroSection } from './components/sections/HeroSection';
import { HowItWorksSection } from './components/sections/HowItWorksSection';
import { PricingSection } from './components/sections/PricingSection';
import { ProblemSection } from './components/sections/ProblemSection';
import { RoleBasedWorkflowSection } from './components/sections/RoleBasedWorkflowSection';
import { SupplierDispatchSection } from './components/sections/SupplierDispatchSection';
import { RegisterPage } from './pages/RegisterPage';

function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return hash;
}

export default function App() {
  const route = useRoute();

  if (route === '#register') {
    return <RegisterPage />;
  }

  return (
    <main className="min-h-screen bg-white text-[#171412]">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FixHistorySection />
      <FeatureSection />
      <RoleBasedWorkflowSection />
      <AIApprovalFlowSection />
      <DashboardPreviewSection />
      <SupplierDispatchSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
