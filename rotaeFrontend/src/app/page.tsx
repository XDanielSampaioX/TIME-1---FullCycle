import { HeroSection } from "@/shared/components/HeroSection";
import { HowItWorks } from "@/shared/components/HowItWorks";
import { PopularDestinations } from "@/shared/components/PopularDestinations";
import { SecuritySection } from "@/shared/components/SecuritySection";

export default function Page() {
  return (
    <main className="home-page">
      <HeroSection />
      <PopularDestinations />
      <HowItWorks />
      <SecuritySection />
    </main>
  );
}
