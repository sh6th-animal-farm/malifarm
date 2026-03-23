import React from "react";
import type { Token } from "../../types/tokenType";
import { tokenApi } from "../../api/tokenApi";

export default function Home() {
  const [tokenId, setTokenId] = React.useState<number | "">("");
  const [tokenData, setTokenData] = React.useState<Token | null>(null);

  const handleTokenBtn = async (tokenId: number) => {
    try {
      const result = await tokenApi.getTokenInfo(tokenId);
      setTokenData(result);
      console.log("토큰 조회 성공 :", result);
    } catch (error) {
      console.error("토큰 조회 실패 :", error.message);
    }
  };

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
        <button
          className="btn btn-primary"
          onClick={() => {
            if (tokenId !== "") {
              handleTokenBtn(tokenId);
            }
          }}
        >
          조회
        </button>
      </div>
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
