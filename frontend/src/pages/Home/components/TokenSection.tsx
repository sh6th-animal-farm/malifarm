import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { homeApi } from "@/api/homeApi";
import type { Token } from "@/types/projectType";
import TokenList from "./TokenList";

export default function TokenSection() {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const data = await homeApi.getMainTokens();
        setTokens(data);
      } catch (e) {
        console.error("토큰 목록 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  if (loading) {
    return (
      <section className="py-14 md:py-20 lg:py-24">
        <div className="layout-container">로딩중...</div>
      </section>
    );
  }

  return (
    <section className="py-14 md:py-20 lg:py-24">
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
          <TokenList tokens={tokens} />
        </div>
      </section>
  )
}
