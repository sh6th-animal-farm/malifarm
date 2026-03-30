import SectionHeader from '@/components/layout/SectionHeader';
import TokenListTable from './components/tokenList/TokenListTable';
import TokenSummaryCard from './components/tokenList/TokenSummaryCard';
import { tokenApi } from '@/api/tokenApi';
import { useEffect, useState } from 'react';
import type { Token } from '@/types/tokenType';
import { useDebounce } from '@/hooks/useDebounce';
import { useTokenList } from '@/hooks/useTokenList.ts';

export default function TokenList() {
  // 훅으로 초기 데이터 + 실시간 업데이트 + 정렬된 리스트를 한 번에 가져옴
  const { tokenList, isLoading } = useTokenList();
  const [hoveredTokenId, setHoveredTokenId] = useState<number | null>(null);
  // 0.3초 동안 hover 상태가 유지될 때만 debouncedId 업데이트
  const debouncedId = useDebounce(hoveredTokenId, 300);

  // 리스트가 로드되었을 때 첫 번째 토큰을 기본으로 보여줌
  useEffect(() => {
    if (!hoveredTokenId && tokenList.length > 0) {
      setHoveredTokenId(tokenList[0].tokenId);
    }
  }, [tokenList, hoveredTokenId]);

  // 로딩 상태 처리
  if (isLoading && tokenList.length === 0) {
    return <div className="p-10 text-center">토큰 목록을 불러오는 중입니다.</div>;
  }

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
