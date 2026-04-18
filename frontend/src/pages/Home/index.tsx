import TokenSection from "./components/TokenSection";
import PartnerSection from "./components/PartnerSection";
import CarbonSection from "./components/CarbonSection";
import ProjectSection from "./components/ProjectSection";
import StatusSection from "./components/StatusSection";
import HeroSection from "./components/HeroSection";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Toast from "@/components/common/Toast";

function Home() {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToastMessage(location.state.toastMessage);
    }
  }, [location.state]);
  
  return (
    <div className="flex flex-col h-[var(--custom-calc-height)] overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />
        )}

        <HeroSection />
        <StatusSection />
        <ProjectSection />
        <CarbonSection />
        <TokenSection />
        <PartnerSection />
      </div>
    </div>
  );
}

export default Home;
