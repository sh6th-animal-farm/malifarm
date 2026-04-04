import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeApi } from '@/api/homeApi';
import type { TokenShort } from '@/types/tokenType';
import TokenTopTen from './TokenTopTen';
import { useTokenList } from '@/pages/Token/hooks/useTokenList.ts';

export default function TokenSection() {
  const { tokenList, isLoading } = useTokenList('CHANGE', 10); // 등락률 높은 순으로 10개 추출

  if (isLoading) {
    return (
      <section className="py-14 md:py-20 lg:py-24">
        <div className="layout-container">실시간 토큰 정보를 불러오는 중입니다.</div>
      </section>
    );
  }

  return (
    <section className="py-14 md:py-20 lg:py-24">
      <div className="layout-container">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h2 className="font-header-01 text-gray-900">토큰 거래소 TOP 10</h2>
          <Link to="/token" className="font-caption-01 text-gray-500">
            전체보기 &gt;
          </Link>
        </div>

        {/* 토큰 거래소 TOP 10 */}
        <TokenTopTen tokens={tokenList} />
      </div>
    </section>
  );
}
