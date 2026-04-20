import TokenSection from "./components/TokenSection";
import PartnerSection from "./components/PartnerSection";
import TrustMetricsSection from "./components/TrustMetricsSection";
import ProjectSection from "./components/ProjectSection";
import StatusSection from "./components/StatusSection";
import HeroSection from "./components/HeroSection";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Toast from "@/components/common/Toast";
import PageShell from "@/components/layout/PageShell";

function Home() {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToastMessage(location.state.toastMessage);
    }
  }, [location.state]);

  return (
    <PageShell>
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage("")}
        />
      )}

      <HeroSection />
      {/* <StatusSection /> */}
      <TrustMetricsSection />
      <ProjectSection />
      <TokenSection />
      <PartnerSection />
    </PageShell>
  );
}

export default Home;
