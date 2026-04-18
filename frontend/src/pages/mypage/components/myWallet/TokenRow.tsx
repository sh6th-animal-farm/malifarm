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
  isMobile?: boolean;
  onClick?: () => void;
}

export default function TokenRow({
  holding,
  isMobile = false,
  onClick,
}: TokenRowProps) {
  if (isMobile) {
    const profitRateInBracket = `(${formatSignedRate(holding.profitLossRate)})`;

    return (
      <article
        className="rounded-[var(--radius-m)] bg-white px-4 py-3 shadow-std transition-colors hover:bg-gray-50 cursor-pointer"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <div className="min-w-0">
          <p className="truncate font-subtitle-01 text-gray-900">{holding.tokenName}</p>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2.5">
          <p className="font-caption-01 text-gray-400">보유수량</p>
          <p className="tabular-nums text-right font-body-03 text-gray-900">
            {numberFormatter.format(toNumber(holding.tokenBalance))} st
          </p>

          <p className="font-caption-01 text-gray-400">평가금액</p>
          <div className="flex tabular-nums items-baseline justify-end gap-1">
            <p className="tabular-nums font-body-03 text-gray-900">
              {formatAmount(holding.marketValue)}
            </p>
            <span className="font-caption-01 font-normal leading-none text-gray-400">
              원
            </span>
          </div>

          <p className="font-caption-01 text-gray-400">평가손익</p>
          <div className="flex tabular-nums items-baseline justify-end gap-1">
            <p
              className={`tabular-nums font-body-03 ${compareAmountColorClass(
                holding.marketValue,
                holding.purchasedValue,
              )}`}
            >
              {formatSignedAmount(holding.profitLoss)}
            </p>
            <span
              className={`font-caption-01 font-normal leading-none ${compareAmountColorClass(
                holding.marketValue,
                holding.purchasedValue,
              )}`}
            >
              원
            </span>
            <p
              className={`tabular-nums font-caption-02 ${rateColorClass(holding.profitLossRate)}`}
            >
              {profitRateInBracket}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className="grid cursor-pointer grid-cols-[1.8fr_1.5fr_1.5fr_1fr] gap-2 px-4 py-3 font-body-01 text-gray-700 transition-colors hover:bg-gray-50 md:px-6 md:py-4"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
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
