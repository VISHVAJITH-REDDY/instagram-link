import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LinkLookup from "@/components/LinkLookup";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <LinkLookup />
      <HowItWorks />
      <CTASection />
    </main>
  );
};

export default Index;
