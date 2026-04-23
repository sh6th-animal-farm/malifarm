import type { Token } from '@/types/tokenType';
import TokenListTableRow from './TokenListTableRow';
import { useNavigate } from 'react-router';

interface TokenTableMainProps {
  tokenList: Token[];
  hoveredTokenId: number | null;
  onHover: (id: number) => void;
}

export default function TokenListTable({
  tokenList,
  hoveredTokenId,
  onHover,
}: TokenTableMainProps) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 max-h-screen overflow-y-auto rounded-lg shadow-std bg-white relative scrollbar-thin scrollbar-thumb-gray-300">
      <table className="w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-10">
          <tr className="flex items-center w-full bg-gray-50 text-gray-400 font-caption-03">
            <th className="w-[50px] lg:w-[80px] py-4 px-2 text-center">순위</th>
            <th className="flex-1 lg:min-w-[150px] py-4 px-2 text-left">
              종목
            </th>
            <th className="w-[100px] lg:w-[160px] py-4 px-2 text-right">
              현재가(KRW)
            </th>
            <th className="hidden lg:block lg:w-[180px] py-4 px-2 text-right">
              등락률
            </th>
            <th className="hidden lg:block lg:w-[160px] py-4 px-2 pr-6 text-right">
              거래대금
            </th>
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
                onClick={() => {
                  navigate(`/token/${token.tokenId}`);
                }}
              />
            ))
          ) : (
            <tr className="flex items-center justify-center w-full min-h-[400px]">
              <td className="text-gray-400 font-body-01">
                데이터를 불러오는 중입니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
