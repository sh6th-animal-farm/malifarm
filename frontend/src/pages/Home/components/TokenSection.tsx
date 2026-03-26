import { Link } from "react-router-dom";
import TokenList from "./TokenList";

export default function TokenSection() {
  return (
    <section className="">
        <div className="layout-container">
          <div className="mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <h2 className="font-header-01 text-gray-900">
              토큰 거래소 TOP 10
            </h2>
            <Link
              to="/token"
              className="font-caption-01 text-gray-500"
            >
              전체보기 &gt;
            </Link>
          </div>

          {/* 토큰 거래소 TOP 10 */}
          <TokenList />
        </div>
      </section>
  )
}
