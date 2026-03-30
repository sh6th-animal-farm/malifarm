import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import CarbonChart from "./CarbonChart";

export default function CarbonSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 py-14 md:py-20 lg:py-24">
      <div className="layout-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-header-01 text-gray-900">
              투명한 탄소 배출권
              <br />
              수익 증명
            </h2>
            <p className="mt-4 mb-8 font-subtitle-03 text-gray-600">
              우리의 스마트팜은 지열 히트펌프 설치 등을 통해 <br className="xl:hidden lg:block md:hidden" />
              탄소 배출을 획기적으로 줄입니다. <br />
              여기서 발생한 KOC 수익은 모두 투자자에게 돌아갑니다.
            </p>
            <Button
              variant="outline-default"
              width={172}
              height={52}
              onClick={() => navigate("/carbon/list")}
            >
              마켓 데이터 보기
            </Button>
          </div>

          <div>
            <CarbonChart />
          </div>
        </div>
      </div>
    </section>
  );
}
