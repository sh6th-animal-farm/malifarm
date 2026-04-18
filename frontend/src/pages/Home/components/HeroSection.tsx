import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import heroSmartFarm from "@/assets/hero-smart-farm.png";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="py-8 md:py-10">
      <div className="layout-container">
        <div
          className="flex min-h-[520px] px-10 items-center rounded-lg bg-cover bg-center bg-no-repeat md:min-h-[620px]"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroSmartFarm})`,
          }}
        >
          <div>
            <span className="inline-flex items-center rounded-full bg-white/85 px-3.5 py-2 font-caption-03 text-green-700">
              Green Investment
            </span>
            <h1 className="mt-6 font-header-hero text-white">
              농장의 주인이 되는
              <br />
              <span className="text-green-200">가장 가벼운 방법</span>
            </h1>
            <p className="mt-4 font-subtitle-03 text-white/90">
              어렵기만 했던 스마트팜 투자,
              <br className="md:hidden" />
              이제 STO 조각 투자로
              <br />
              수익과 탄소배출권까지 한 번에 관리하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="check"
                width={172}
                height={52}
                onClick={() => navigate("/auth/signup")}
              >
                지금 시작하기
              </Button>
              <Button variant="outline-default" width={140} height={52}>
                이용 가이드
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
