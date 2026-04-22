import { Link } from 'react-router-dom';
import type { TokenShort } from '@/types/tokenType';

export default function TokenTopTen({ tokens }: { tokens: TokenShort[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tokens.map((token, index) => (
        <Link
          to={`/token/${token.tokenId}`}
          className="shadow-std flex min-w-0 items-center justify-between gap-3 rounded-lg bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:bg-gray-100 md:px-6 md:py-5"
          key={token.tokenId}
        >
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <span className="w-5 shrink-0 font-header-04 text-green-600 md:w-6">
              {index + 1}
            </span>
            <span className="truncate font-body-03 text-gray-900">
              {token.tokenName}
            </span>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-body-03 text-gray-900 md:font-subtitle-01">
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
