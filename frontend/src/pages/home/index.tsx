import TokenSection from "./components/TokenSection";
import PartnerSection from "./components/PartnerSection";
import TrustMetricsSection from "./components/TrustMetricsSection";
import ProjectSection from "./components/ProjectSection";
import HeroSection from "./components/HeroSection";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Toast from "@/components/common/Toast";
import PageShell from "@/components/layout/PageShell";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const message = location.state?.toastMessage;
    if (!message) return;

    setToastMessage(message);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location.pathname, location.state, navigate]);

  return (
    <PageShell>
      <div className="min-w-0 overflow-x-hidden">
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />
        )}

        <HeroSection />
        <TrustMetricsSection />
        <ProjectSection />
        <TokenSection />
        <PartnerSection />
      </div>
    </PageShell>
  );
}

export default Home;