import type { TokenListItem } from "@/types/tokenType";
import TokenListTableRow from "./TokenListTableRow";

interface TokenTableMainProps {
  tokenList: TokenListItem[];
  onHover: (id: number) => void;
  hoveredTokenId: number | null;
}

export default function TokenListTable({
  tokenList,
  onHover,
  hoveredTokenId,
}: TokenTableMainProps) {
  return (
    <div className="flex-1 max-h-screen overflow-y-auto rounded-[var(--radius-m)] shadow-std bg-white relative scrollbar-thin scrollbar-thumb-gray-300">
      <table className="w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-10">
          <tr className="flex items-center w-full bg-white text-gray-400 font-caption-03">
            <th className="w-[80px] py-4 px-2 text-center">순위</th>
            <th className="flex-1 min-w-[150px] py-4 px-2 text-left">종목</th>
            <th className="w-[160px] py-4 px-2 text-right">현재가(KRW)</th>
            <th className="w-[160px] py-4 px-2 text-right">등락률</th>
            <th className="w-[180px] py-4 px-2 pr-6 text-right">거래대금</th>
          </tr>
        </thead>
        <tbody className="block w-full">
          {tokenList.length > 0 ? (
            tokenList.map((token, index) => (
              <TokenListTableRow
                key={token.tokenId}
                token={token}
                index={index}
                isActive={hoveredTokenId === token.tokenId}
                onHover={onHover}
              />
            ))
          ) : (
            <tr className="block w-full">
              <td className="block w-full py-[60px] text-center text-gray-400">
                토큰 목록이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
