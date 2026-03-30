import SectionHeader from '@/components/layout/SectionHeader';
import TokenListTable from './components/tokenList/TokenListTable';
import TokenSummaryCard from './components/tokenList/TokenSummaryCard';
import { tokenApi } from '@/api/tokenApi';
import { useEffect, useState } from 'react';
import type { Token } from '@/types/tokenType';
import { useDebounce } from '@/hooks/useDebounce';

export default function TokenList() {
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [hoveredTokenId, setHoveredTokenId] = useState<number | null>(null);
  const debouncedId = useDebounce(hoveredTokenId, 300); // 0.3초 동안 hover 상태가 유지될 때만 debouncedId 업데이트

  useEffect(() => {
    const fetchAllToken = async () => {
      try {
        const data = await tokenApi.getTokenList();
        setTokenList(data);

        if (data.length > 0) {
          setHoveredTokenId(data[0].tokenId);
        }
      } catch (e) {
        console.error('토큰 목록 로드 실패', e);
      }
    };

    fetchAllToken();
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
          hoveredTokenId={hoveredTokenId}
          onHover={setHoveredTokenId}
        />
        {debouncedId !== null ? (
          <TokenSummaryCard tokenId={debouncedId} />
        ) : (
          <div className="w-[432px] h-[468px] bg-gray-50 animate-pulse rounded-[var(--radius-m)]" />
        )}
      </div>
    </div>
  );
}
