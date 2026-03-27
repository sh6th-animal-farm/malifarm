import { useNavigate } from "react-router-dom";
import Button from "@/components/common/button";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 pt-14 md:pt-20 lg:pt-24">
      <div className="layout-container">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full bg-green-0 px-3.5 py-2 font-caption-03 text-green-700">
              Green Investment
            </span>
            <h1 className="mt-6 font-header-hero text-gray-900">
              농장의 주인이 되는
              <br />
              <span className="text-green-600">가장 가벼운 방법</span>
            </h1>
            <p className="mt-4 font-subtitle-03 text-gray-600">
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

          <div className="flex justify-center lg:justify-end">
            <img
              src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?q=80&w=600"
              alt="스마트팜"
              className="h-80 w-full max-w-xl rounded-hero-image object-cover shadow-std md:h-96"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
