import type { WalletInfoDTO } from "@/types/myPageType";
import {
  compareAmountColorClass,
  formatAmount,
  formatSignedAmount,
  formatSignedRate,
  rateColorClass,
} from "./walletFormatters";

interface InvestmentProps {
  walletInfo: WalletInfoDTO | null;
}

export default function Investment({ walletInfo }: InvestmentProps) {
  const safeWalletInfo = walletInfo ?? {
    totalBalance: 0,
    cashBalance: 0,
    totalPurchasedValue: 0,
    totalMarketValue: 0,
    profitLoss: 0,
    profitLossRate: 0,
  };

  const summaryItems = [
    {
      label: "총 자산 현황",
      amount: formatAmount(safeWalletInfo.totalBalance),
      unit: "원",
      valueClass: "text-gray-900",
      unitClass: "text-gray-500",
    },
    {
      label: "예수금",
      amount: formatAmount(safeWalletInfo.cashBalance),
      unit: "원",
      valueClass: "text-gray-900",
      unitClass: "text-gray-500",
    },
    {
      label: "매입금액",
      amount: formatAmount(safeWalletInfo.totalPurchasedValue),
      unit: "원",
      valueClass: "text-gray-900",
      unitClass: "text-gray-500",
    },
    {
      label: "평가금액",
      amount: formatAmount(safeWalletInfo.totalMarketValue),
      unit: "원",
      valueClass: "text-gray-900",
      unitClass: "text-gray-500",
    },
    {
      label: "평가손익",
      amount: formatSignedAmount(safeWalletInfo.profitLoss),
      unit: "원",
      valueClass: compareAmountColorClass(
        safeWalletInfo.totalMarketValue,
        safeWalletInfo.totalPurchasedValue,
      ),
      unitClass: compareAmountColorClass(
        safeWalletInfo.totalMarketValue,
        safeWalletInfo.totalPurchasedValue,
      ),
    },
    {
      label: "수익률",
      amount: formatSignedRate(safeWalletInfo.profitLossRate),
      unit: "",
      valueClass: rateColorClass(safeWalletInfo.profitLossRate),
      unitClass: "text-gray-500",
    },
  ];

  return (
    <section className="mb-8 grid grid-cols-2 gap-0 rounded-lg bg-white px-4 py-3 shadow-std md:grid-cols-3 md:px-6 md:py-4">
      {summaryItems.map(({ label, amount, valueClass, unit, unitClass }, index) => (
        <div
          key={label}
          className={[
            "flex flex-col items-end gap-1 px-3 py-2.5 md:px-4 md:py-3",
            index % 2 === 0 ? "border-r border-gray-100" : "",
            index < 4 ? "border-b border-gray-100" : "",
            index % 3 !== 2 ? "md:border-r md:border-gray-100" : "md:border-r-0",
            index < 3 ? "md:border-b md:border-gray-100" : "md:border-b-0",
            index % 2 === 0 ? "pl-0" : "",
            index % 2 === 1 ? "pr-0" : "",
            index % 3 === 0 ? "md:pl-0" : "",
            index % 3 === 2 ? "md:pr-0" : "",
          ].join(" ")}
        >
          <p className="self-start text-left font-caption-01 text-gray-500">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className={`font-subtitle-01 tabular-nums ${valueClass}`}>{amount}</p>
            {unit ? <span className={`font-caption-01 leading-none ${unitClass}`}>{unit}</span> : null}
          </div>
        </div>
      ))}
    </section>
  );
}
