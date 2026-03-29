import Icon from "@/components/icon";
import { numberFormatter, toNumber } from "./walletFormatters";
import type { WalletInfoDTO } from "@/types/myPageType";

interface AccountProps {
  walletInfo: WalletInfoDTO | null;
  loading?: boolean;
}

export default function Account({ walletInfo, loading = false }: AccountProps) {
  const hasLinkedAccount = Boolean(walletInfo?.accountNo);
  const availableAmount = walletInfo
    ? toNumber(walletInfo.cashBalance) - toNumber(walletInfo.frozenAmount)
    : 0;

  return (
    <section className="mb-5 rounded-lg bg-white p-4 shadow-std md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Icon name="warning" size={18} color="var(--color-gray-500)" />
          </div>
          <div className="min-w-0 min-h-12 flex items-center">
            {hasLinkedAccount ? (
              <div>
                <p className="truncate font-caption-01 text-gray-400">
                  {walletInfo?.bankName}
                </p>
                <p className="mt-1 truncate font-body-02 text-gray-900">
                  {walletInfo?.accountNo}
                </p>
              </div>
            ) : (
              <p className="font-body-02 text-gray-500">
                {!loading ? "연동된 계좌가 없습니다." : "\u00A0"}
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="mb-1 font-caption-01 text-gray-400">사용 가능 금액</p>
          <p className="font-header-03 text-gray-900">
            {numberFormatter.format(availableAmount)}
            <span className="ml-1 font-caption-01 text-gray-500">원</span>
          </p>
        </div>
      </div>
    </section>
  );
}
