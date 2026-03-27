import SectionHeader from "@/components/layout/SectionHeader";
import TokenListTable from "./components/TokenListTable";
import TokenSummaryChart from "./components/TokenSummaryChart";
import { tokenApi } from "@/api/tokenApi";
import { useEffect, useState } from "react";
import type { TokenListItem } from "@/types/tokenType";

export default function TokenList() {
  const [tokenList, setTokenList] = useState<TokenListItem[]>([]);
  const [activeTokenId, setActiveTokenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const data = await tokenApi.getTokenList();
        setTokenList(data);

        if (data.length > 0) {
          setActiveTokenId(data[0].tokenId);
        }
      } catch (e) {
        console.error("토큰 목록 로드 실패", e);
      }
    };

    fetchTokens();
  }, []);

  return (
    <div className="container">
      <SectionHeader
        title="토큰 거래소"
        subtitle="실시간 차트를 확인해보세요."
      />
      <div className="flex gap-4">
        <TokenListTable
          tokenList={tokenList}
          onRowClick={setActiveTokenId}
          activeTokenId={activeTokenId}
        />
        <TokenSummaryChart />
      </div>
    </div>
  );
}
