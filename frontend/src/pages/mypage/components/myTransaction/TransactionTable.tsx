import type { MyTransactionHistDTO } from "@/types/myPageType";
import {
  formatDateTime,
  formatSt,
  formatWon,
  typeColorClass,
  typeLabelMap,
} from "./transactionFormatters";

interface TransactionTableProps {
  loading: boolean;
  transactions: MyTransactionHistDTO[];
}

export default function TransactionTable({ loading, transactions }: TransactionTableProps) {
  return (
    <section className="rounded-lg bg-white shadow-std">
      <div className="overflow-x-auto">
        <div className="min-w-max md:min-w-full">
          <div className="grid grid-cols-[1.4fr_0.7fr_1.8fr_0.9fr_0.9fr_1.4fr] gap-2 bg-gray-50 px-4 py-3 font-body-02 text-gray-500 md:px-6 md:py-4">
            <span>거래일시</span>
            <span>구분</span>
            <span>종목명</span>
            <span className="text-right">체결단가</span>
            <span className="text-right">거래수량</span>
            <span className="text-right">거래금액 / 거래후잔액</span>
          </div>
          {!loading && transactions.length > 0 ? (
            <div>
              {transactions.map((tx, index) => (
                <div
                  key={`${tx.transactionId}-${tx.createdAt}-${index}`}
                  className="grid grid-cols-[1.4fr_0.7fr_1.8fr_0.9fr_0.9fr_1.4fr] items-center gap-2 border-t border-gray-100 px-4 py-5 font-body-01 text-gray-700 md:px-6"
                >
                  <span className="font-body-02 text-gray-900">{formatDateTime(tx.createdAt)}</span>
                  <span className={`font-body-03 ${typeColorClass(tx.transactionType)}`}>
                    {typeLabelMap[tx.transactionType] ?? tx.transactionType}
                  </span>
                  <div>
                    <p className="font-body-03 text-gray-900">{tx.tokenName ?? "-"}</p>
                    <p className="mt-1 font-caption-01 text-gray-500">{tx.tickerSymbol ?? "-"}</p>
                  </div>
                  <span className="text-right font-body-03 text-gray-900">
                    {formatWon(tx.executedPrice)}
                  </span>
                  <span className="text-right font-body-03 text-gray-900">
                    {formatSt(tx.executedVolume)}
                  </span>
                  <div className="text-right">
                    <p className="font-body-03 text-gray-900">{formatWon(tx.executedAmount)}</p>
                    <p className="mt-1 font-caption-01 text-gray-500">
                      {formatWon(tx.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center font-body-01 text-gray-400 md:py-20">
              {loading ? "불러오는 중..." : "거래 내역이 존재하지 않습니다."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
