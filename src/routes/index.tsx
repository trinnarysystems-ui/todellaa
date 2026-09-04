import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import GridLines from "@/components/landingpage ui/GridLines";
import Navbar from "@/components/landingpage ui/Navbar";
import PilotBanner from "@/components/landingpage ui/PilotBanner";
import Hero from "@/components/landingpage ui/Hero";
import Stats from "@/components/landingpage ui/Stats";
import HeroImage from "@/components/landingpage ui/HeroImage";
import Capabilities from "@/components/landingpage ui/Capabilities";
import WhoWeServe from "@/components/landingpage ui/WhoWeServe";
import SystemComponents from "@/components/landingpage ui/SystemComponents";
import Pricing from "@/components/landingpage ui/Pricing";
import CTABanner from "@/components/landingpage ui/CTABanner";
import FAQ from "@/components/landingpage ui/FAQ";
import Footer from "@/components/landingpage ui/Footer";
import PilotRegistrationModal from "@/components/PilotRegistrationModal";

export { Navbar, Footer };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Todellaa | Payment Verification & Reconciliation" },
      { name: "description", content: "Todellaa helps businesses verify payments, reconcile transactions, and maintain accurate financial records with confidence." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  const handleOpenTrialModal = () => {
    setTrialModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-white text-[#010101] font-sans antialiased selection:bg-[#e8562a] selection:text-white overflow-x-hidden">
      {/* Background Grid Lines */}
      <GridLines />

      {/* Top Pilot Banner */}
      <PilotBanner onOpenTrialModal={handleOpenTrialModal} />

      {/* Page Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="grow">
          <Hero onOpenTrialModal={handleOpenTrialModal} />
          <Stats />
          <HeroImage />
          <Capabilities />
          <WhoWeServe />
          <SystemComponents />
          <Pricing onOpenTrialModal={handleOpenTrialModal} />
          <CTABanner onOpenTrialModal={handleOpenTrialModal} />
          <FAQ />
        </main>
        <Footer />
      </div>

      {/* Registration & Survey Modal */}
      <PilotRegistrationModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
      />
    </div>
  );
}
