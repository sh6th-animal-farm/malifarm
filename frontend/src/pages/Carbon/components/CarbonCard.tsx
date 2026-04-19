// src/pages/Carbon/components/CarbonCard.tsx
import { useNavigate } from "react-router-dom";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import type { CarbonListDTO } from "@/types/carbonType";

interface CarbonCardProps {
  item: CarbonListDTO;
}

export default function CarbonCard({ item }: CarbonCardProps) {
  const navigate = useNavigate();
  const isRemoval = item.category === "REMOVAL";
  const badgeVariant = isRemoval ? "success" : "info";
  const badgeLabel = isRemoval ? "제거형" : "감축형";
  const discountRate = Number(item.userBenefit?.discountRate ?? 0);
  const hasDiscount = discountRate > 0;
  const currentPrice = Number(item.userBenefit?.currentPrice ?? item.cpPrice ?? 0);
  const originalPrice = Number(item.cpPrice ?? 0);
  const navigateToDetail = () => navigate(`/carbon/${item.cpId}`);

  return (
    <article
      className="group font-main tracking-std bg-white rounded-(--radius-lg) overflow-hidden border border-(--color-gray-100) shadow-(--shadow-std) box-border flex flex-col h-full cursor-pointer transition duration-200 hover:-translate-y-1"
      role="link"
      tabIndex={0}
      onClick={navigateToDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigateToDetail();
        }
      }}
    >
      <div className="relative h-55 bg-(--color-gray-100) overflow-hidden shrink-0">
        <img
          src={item.thumbnailUrl || "/resources/img/carbon_sample.jpg"}
          alt={item.cpTitle}
          className="w-full h-full object-cover block transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-4 top-4">
          <Badge
            variant={badgeVariant}
            width="auto"
            height={28}
            className="font-caption-03"
          >
            {badgeLabel} · {item.vintageYear}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        
        <div className="line-clamp-2 font-subtitle-00 leading-[1.35] text-gray-900">
          {item.cpTitle}
        </div>

        <div className="mt-5 mb-4 h-px bg-gray-100" />

        <div className="flex items-baseline justify-between gap-2.5">
          <span className="font-caption-01 text-gray-500">구매 가능 수량</span>
          <span className="font-body-03 text-gray-900">
            {item.cpAmount ? Number(item.cpAmount).toLocaleString() : "-"} tCO2e
          </span>
        </div>

        <div className="mt-4 flex flex-1 flex-col justify-end text-right">
          <div className="mb-1 min-h-5">
            {hasDiscount && (
              <>
                <span className="mr-2 font-caption-01 text-gray-400 line-through">
                  {originalPrice.toLocaleString()} P
                </span>
                <span className="font-caption-02 text-error">
                  {discountRate}% 할인
                </span>
              </>
            )}
          </div>
          <div className="font-header-03 text-gray-900">
            {(hasDiscount ? currentPrice : originalPrice).toLocaleString()} P
          </div>
        </div>

        <Button
          onClick={(event) => {
            event.stopPropagation();
            navigateToDetail();
          }}
          variant={isRemoval ? "default" : "default-info"}
          width="100%"
          height={56}
          className="mt-5 shrink-0"
        >
          상세 보기 및 주문
        </Button>
      </div>

    </article>
  );
}
