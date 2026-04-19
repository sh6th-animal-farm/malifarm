import { Link } from 'react-router-dom';
import type { TokenShort } from '@/types/tokenType';

export default function TokenTopTen({ tokens }: { tokens: TokenShort[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tokens.map((token, index) => (
        <Link
          to={`/token/${token.tokenId}`}
          className="shadow-std rounded-lg bg-white flex justify-between px-6 py-5 transition hover:-translate-y-0.5 hover:bg-gray-100"
          key={token.tokenId}
        >
          <div className="flex items-center gap-4">
            <span className="w-6 font-header-04 text-green-600">
              {index + 1}
            </span>
            <span className="font-body-03 text-gray-900">
              {token.tokenName}
            </span>
          </div>

          <div className="text-right">
            <div className="font-subtitle-01 text-gray-900">
              {token.marketPrice.toLocaleString()}원
            </div>
            <div
              className={`mt-1 font-body-02 ${
                token.changeRate > 0
                  ? 'text-error'
                  : token.changeRate < 0
                    ? 'text-info'
                    : 'text-gray-900'
              }`}
            >
              {token.changeRate > 0 ? '+' : ''}
              {token.changeRate.toFixed(2)}%
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
