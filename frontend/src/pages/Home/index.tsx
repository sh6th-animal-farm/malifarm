import React, { useState } from "react";
import type { Token } from "@/types/tokenType";
import { tokenApi } from "@/api/tokenApi";
import Button from "@/components/common/Button";
import Tag from "@/components/common/Tag";
import FilterGroup from "@/components/common/FilterGroup";
import TabMenu from "@/components/common/TabMenu";

export default function Home() {
  const [tokenId, setTokenId] = React.useState<number | "">("");
  const [tokenData, setTokenData] = React.useState<Token | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTab, setselectedTab] = useState("token");

  const handleTokenBtn = async (tokenId: number) => {
    try {
      const result = await tokenApi.getTokenInfo(tokenId);
      setTokenData(result);
      console.log("토큰 조회 성공 :", result);
    } catch (error) {
      console.error("토큰 조회 실패 :", error.message);
    }
  };

  const filterItems = [
    { text: "전체보기", value: "all" },
    { text: "청약중", value: "subscription" },
    { text: "진행중", value: "ongoing" },
  ];

  const tabItems = [
    { text: "토큰", value: "token", count: 3 },
    { text: "프로젝트", value: "project", count: 2 },
  ];

  return (
    <div className="container">
      <h1 className="font-header-01 text-green-600">메인 홈 페이지</h1>
      <h1 className="font-header-02 text-gray-800 mt-8 mb-4">
        API 테스트 - 토큰 조회
      </h1>
      <div className="flex gap-x-1 mb-4">
        토큰 번호:{" "}
        <input
          type="number"
          className="max-w-[140px] border p-1 rounded-s"
          value={tokenId}
          onChange={(e) => {
            const val = e.target.value;
            setTokenId(val === "" ? "" : Number(val));
          }}
        />
      </div>
      <Button
        variant="check"
        children="로그인"
        onClick={() => {
          if (tokenId !== "") {
            handleTokenBtn(tokenId);
          }
        }}
      />

      <div className="mt-4" />
      <Tag variant="info">공고중</Tag>

      <div className="mt-4" />
      <FilterGroup
        items={filterItems}
        currentValue={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      <div className="mt-4" />
      <TabMenu
        items={tabItems}
        currentValue={selectedTab}
        onTabChange={setselectedTab}
      />

      {tokenData && (
        <div className="p-4 border rounded">
          <h2 className="font-subtitle-01 text-gray-800 mb-2">토큰 정보</h2>
          <p>토큰 ID: {tokenData.tokenId}</p>
          <p>프로젝트 ID: {tokenData.projectId}</p>
          <p>토큰 이름: {tokenData.tokenName}</p>
          <p>티커 심볼: {tokenData.tickerSymbol}</p>
          <p>총 공급량: {tokenData.totalSupply}</p>
        </div>
      )}
    </div>
  );
}
