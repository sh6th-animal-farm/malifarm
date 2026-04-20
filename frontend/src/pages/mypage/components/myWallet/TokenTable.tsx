import type { HoldingDTO } from "@/types/myPageType";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import TokenRow from "./TokenRow";

interface TokenTableProps {
  loading: boolean;
  holdings: HoldingDTO[];
  onTokenClick?: (holding: HoldingDTO) => void;
}

export default function TokenTable({
  loading,
  holdings,
  onTokenClick,
}: TokenTableProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const stateRowClassName =
    "flex min-h-40 items-center justify-center px-4 py-3 text-center font-body-01 text-gray-400 md:px-6 md:py-4";

  if (isMobile) {
    return (
      <section className="space-y-3">
        {loading ? (
          <div className={stateRowClassName}>불러오는 중...</div>
        ) : holdings.length > 0 ? (
          holdings.map((holding, index) => (
            <TokenRow
              key={`${holding.tokenId ?? holding.tokenName}-${index}`}
              holding={holding}
              isMobile
              onClick={() => onTokenClick?.(holding)}
            />
          ))
        ) : (
          <div className={stateRowClassName}>보유 토큰이 없습니다.</div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white shadow-std">
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-[1.8fr_1.5fr_1.5fr_1fr] gap-2 bg-gray-50 px-4 py-4 font-body-02 text-gray-500 md:px-6">
            <span>토큰명</span>
            <span className="text-right">평가손익 / 수익률</span>
            <span className="text-right">평가금액 / 매입금액</span>
            <span className="text-right">보유수량</span>
          </div>
          <div>
            {loading ? (
              <div className={stateRowClassName}>불러오는 중...</div>
            ) : holdings.length > 0 ? (
              <div>
                {holdings.map((holding, index) => (
                  <TokenRow
                    key={`${holding.tokenId ?? holding.tokenName}-${index}`}
                    holding={holding}
                    onClick={() => onTokenClick?.(holding)}
                  />
                ))}
              </div>
            ) : (
              <div className={stateRowClassName}>보유 토큰이 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
