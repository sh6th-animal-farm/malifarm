import TokenSection from "./components/TokenSection";
import PartnerSection from "./components/PartnerSection";
import CarbonSection from "./components/CarbonSection";
import ProjectSection from "./components/ProjectSection";
import StatusSection from "./components/StatusSection";
import HeroSection from "./components/HeroSection";

function Home() {
  return (
    <div className="flex flex-col gap-24">
      <HeroSection />
      <StatusSection />
      <ProjectSection />
      <CarbonSection />
      <TokenSection />
      <PartnerSection />
    </div>
  );
}

export default Home;
