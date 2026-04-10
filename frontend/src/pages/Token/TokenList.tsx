import SectionHeader from '@/components/layout/SectionHeader';
import TokenListTable from './components/tokenList/TokenListTable';
import TokenSummaryCard from './components/tokenList/TokenSummaryCard';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useTokenList } from '@/pages/Token/hooks/useTokenList';
import { useTokenChart } from '@/pages/Token/hooks/useTokenChart.ts';

export default function TokenList() {
  // 훅으로 초기 데이터 + 실시간 업데이트 + 정렬된 리스트를 한 번에 가져옴
  const { tokenList = [], isLoading } = useTokenList('VOLUME');
  const [hoveredTokenId, setHoveredTokenId] = useState<number | null>(null);
  // 0.3초 동안 hover 상태가 유지될 때만 debouncedId 업데이트
  const debouncedId = useDebounce(hoveredTokenId, 300);

  // 리스트가 로드되었을 때 첫 번째 토큰을 기본으로 보여줌
  useEffect(() => {
    if (!hoveredTokenId && tokenList?.length > 0) {
      setHoveredTokenId(tokenList[0].tokenId);
    }
  }, [tokenList]);

  const displayId = debouncedId ?? hoveredTokenId ?? tokenList[0]?.tokenId;

  // 로딩 상태 처리
  if (isLoading && (!tokenList || tokenList.length === 0)) {
    return (
      <div className="p-10 text-center">토큰 목록을 불러오는 중입니다.</div>
    );
  }

  return (
    <div className="">
      <section className="layout-container py-20 md:py-20">
        <SectionHeader
          title="토큰 거래소"
          subtitle="실시간 차트를 확인해보세요."
        />
        <div className="flex items-start gap-4">
          <TokenListTable
            tokenList={tokenList}
            hoveredTokenId={hoveredTokenId}
            onHover={setHoveredTokenId}
          />
          <aside className="sticky top-20 self-start">
            {displayId !== null ? (
              <TokenSummaryCard tokenId={displayId} />
            ) : (
              <div className="w-[432px] h-[468px] bg-gray-50 animate-pulse rounded-lg]" />
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
