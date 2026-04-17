import Icon from "@/components/icon";
import type { IconName } from "@/components/icon/iconTypes";
import type { NewsItemDTO } from "../mockNews";

function getValueColorClass(value: string) {
  const numericValue = Number(value.replace("%", ""));

  if (Number.isNaN(numericValue)) return "text-gray-900";
  if (numericValue > 0) return "text-error";
  if (numericValue < 0) return "text-info";
  return "text-gray-900";
}

function getValueIconName(value: string): IconName | null {
  const numericValue = Number(value.replace("%", ""));

  if (Number.isNaN(numericValue) || numericValue === 0) return null;
  return numericValue > 0 ? "price_up" : "price_down";
}

type NewsBriefingProps = {
  briefing: NonNullable<NewsItemDTO["briefing"]>;
};

export default function NewsBriefing({ briefing }: NewsBriefingProps) {
  return (
    <section>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex h-full flex-col justify-center rounded-lg bg-gray-50 px-5 py-4 text-center">
          <p className="font-caption-02 text-gray-500">시장 투심 (ADR)</p>
          <div
            className={`mt-3 flex items-center justify-center gap-2 font-header-02 ${getValueColorClass(briefing.marketSentiment.value)}`}
          >
            {getValueIconName(briefing.marketSentiment.value) && (
              <Icon
                name={getValueIconName(briefing.marketSentiment.value)!}
                size={18}
              />
            )}
            <p>{briefing.marketSentiment.value}</p>
          </div>
        </div>

        <div className="flex h-full flex-col justify-center rounded-lg bg-gray-50 px-5 py-4 text-center">
          <p className="font-caption-02 text-gray-500">유동성 흐름</p>
          <div
            className={`mt-3 flex items-center justify-center gap-2 font-header-02 ${getValueColorClass(briefing.liquidityFlow.value)}`}
          >
            {getValueIconName(briefing.liquidityFlow.value) && (
              <Icon
                name={getValueIconName(briefing.liquidityFlow.value)!}
                size={18}
              />
            )}
            <p>{briefing.liquidityFlow.value}</p>
          </div>
        </div>

        <div className="flex h-full flex-col justify-center rounded-lg bg-gray-50 px-5 py-4 text-center">
          <p className="font-caption-02 text-gray-500">오늘의 핫 토큰</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {briefing.hotTokens.map((token) => (
              <button
                key={token}
                type="button"
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-3 py-1 font-caption-02 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {token}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
