import { Link } from "react-router-dom";
import { topTokens } from "@/pages/home/data/data";

export default function TokenList() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {topTokens.map((token, index) => (
        <Link
          to={`/token/${token.tokenId}`}
          className="shadow-std rounded-lg flex justify-between px-6 py-5 transition hover:-translate-y-0.5 hover:bg-green-0"
          key={token.tokenId}
        >
          <div className="flex items-center gap-4">
            <span className="w-6 font-header-04 text-green-600">
              {index + 1}
            </span>
            <span className="font-body-03 text-gray-900">{token.tokenName}</span>
          </div>

          <div className="text-right">
            <div className="font-subtitle-01 text-gray-900">
              {token.marketPrice.toLocaleString()}원
            </div>
            <div className={`mt-1 font-body-02 ${
                token.changeRate >= 0 ? "text-error" : "text-info"
              }`}
            >
              {token.changeRate > 0 ? "+" : ""}
              {token.changeRate.toFixed(2)}%
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
