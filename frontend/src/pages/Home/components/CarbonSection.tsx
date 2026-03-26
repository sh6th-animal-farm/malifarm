import { Link } from "react-router-dom";
import CarbonChart from "./CarbonChart";

export default function CarbonSection() {
  return (
    <section className=" bg-gray-50 py-20">
      <div className="layout-container">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-[clamp(1.5rem,2vw,2rem)] leading-[1.25] font-extrabold text-gray-900">
              투명한 탄소 배출권
              <br />
              수익 증명
            </h2>
            <p className="mt-4 mb-8 leading-[1.8] text-gray-600">
              우리의 스마트팜은 지열 히트펌프 설치 등을 통해 탄소 배출을
              획기적으로 줄입니다. 여기서 발생한 KOC 수익은 모두 투자자에게
              돌아갑니다.
            </p>
            <Link className="btn-outline-green" to="/carbon/list">
              마켓 데이터 보기
            </Link>
          </div>

          <div>
            <CarbonChart />
          </div>
        </div>
      </div>
    </section>
  );
}
