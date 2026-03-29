import type { HoldingDTO } from "@/types/myPageType";
import {
  compareAmountColorClass,
  formatAmount,
  formatSignedAmount,
  formatSignedRate,
  numberFormatter,
  rateColorClass,
  toNumber,
} from "./walletFormatters";

interface TokenRowProps {
  holding: HoldingDTO;
}

export default function TokenRow({ holding }: TokenRowProps) {
  return (
    <div className="grid grid-cols-[2.2fr_1.4fr_1.4fr_1fr] gap-2 px-4 py-3 font-body-01 text-gray-700 md:px-6 md:py-4">
      <div>
        <p className="font-body-03 text-gray-900">{holding.tokenName}</p>
        <p className="mt-1 font-caption-01 text-gray-400">{holding.tickerSymbol}</p>
      </div>
      <div className="text-right">
        <div className="flex items-baseline justify-end gap-1">
          <p
            className={`font-body-03 ${compareAmountColorClass(
              holding.marketValue,
              holding.purchasedValue,
            )}`}
          >
            {formatSignedAmount(holding.profitLoss)}
          </p>
          <span
            className={`font-caption-01 ${compareAmountColorClass(
              holding.marketValue,
              holding.purchasedValue,
            )} leading-none`}
          >
            원
          </span>
        </div>
        <p className={`mt-1 font-caption-01 ${rateColorClass(holding.profitLossRate)}`}>
          {formatSignedRate(holding.profitLossRate)}
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-baseline justify-end gap-1">
          <p className="font-body-03 text-gray-900">{formatAmount(holding.marketValue)}</p>
          <span className="font-caption-01 leading-none text-gray-500">원</span>
        </div>
        <div className="mt-1 flex items-baseline justify-end gap-1">
          <p className="font-caption-01 text-gray-400">{formatAmount(holding.purchasedValue)}</p>
          <span className="font-caption-01 leading-none text-gray-500">원</span>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <p className="text-right font-body-03 text-gray-900">
          {numberFormatter.format(toNumber(holding.tokenBalance))} st
        </p>
      </div>
    </div>
  );
}
