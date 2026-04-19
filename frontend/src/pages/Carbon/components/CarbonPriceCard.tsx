import Button from "@/components/common/Button";

interface CarbonPriceCardProps {
  projectCategory: string;
  vintageYear: string | number;
  projectName: string;
  originalPrice: number;
  discountRate: number;
  currentPrice: number;
  onOrderClick: () => void;
}

export default function CarbonPriceCard({
  projectCategory,
  vintageYear,
  projectName,
  originalPrice,
  discountRate,
  currentPrice,
  onOrderClick,
}: CarbonPriceCardProps) {
  const hasDiscount = discountRate > 0;
  const finalPrice = hasDiscount ? currentPrice : originalPrice;

  return (
    <div className="w-full">
      <div className="rounded-lg bg-white p-4 lg:hidden">
        <p className="mb-1 font-caption-03 text-green-600">
          {projectCategory} 프로젝트 | {vintageYear} 빈티지
        </p>
        <h2 className="font-subtitle-00 leading-tight text-gray-900">{projectName}</h2>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-caption-01 text-gray-500">단위</span>
            <span className="font-body-02 text-gray-600">1 tCO2e</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-caption-01 text-gray-500">정가</span>
            <span className="font-body-02 text-gray-500 line-through">
              {originalPrice.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-caption-01 text-gray-500">할인율</span>
            <span className={`font-body-03 ${hasDiscount ? "text-error" : "text-gray-500"}`}>
              {hasDiscount ? `${discountRate}%` : "-"}
            </span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between pt-1">
            <span className="font-caption-03 text-gray-700">최종 가격</span>
            <strong className="font-header-03 text-gray-900">
              {finalPrice.toLocaleString()}원
            </strong>
          </div>
        </div>

        <p className="mt-2 text-right font-caption-01 text-gray-400">
          * 부가세(VAT) 별도 금액
        </p>

        <Button
          onClick={onOrderClick}
          variant="default"
          width="100%"
          height={52}
          className="mt-4"
        >
          구매하기
        </Button>
      </div>

      <div className="relative hidden rounded-lg bg-white p-8 shadow-std lg:block">
        <div className="space-y-6">
          <div>
            <p className="mb-1 font-caption-03 text-green-600">
              {projectCategory} 프로젝트 | {vintageYear} 빈티지
            </p>
            <h2 className="font-header-03 leading-tight text-gray-900">{projectName}</h2>
          </div>

          <div className="rounded-lg bg-gray-50 p-5">
            <div className="flex items-center justify-between py-1">
              <span className="font-caption-01 text-gray-500">단위</span>
              <span className="font-body-02 text-gray-500">1 tCO2e</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-caption-01 text-gray-500">정가</span>
              <span className="font-body-02 text-gray-500 line-through">
                {originalPrice.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-caption-01 text-gray-500">할인율</span>
              <span className={`font-body-03 ${hasDiscount ? "text-error" : "text-gray-500"}`}>
                {hasDiscount ? `${discountRate}%` : "-"}
              </span>
            </div>
            <div className="mt-2 h-px bg-gray-200" />
            <div className="flex items-center justify-between pt-3">
              <span className="font-caption-03 text-gray-700">최종 가격</span>
              <strong className="font-header-02 text-gray-900">
                {finalPrice.toLocaleString()}원
              </strong>
            </div>
          </div>

          <p className="text-right font-caption-01 text-gray-400">
            * 부가세(VAT) 별도 금액
          </p>
        </div>

        <Button
          onClick={onOrderClick}
          variant="default"
          width="100%"
          height={56}
          className="mt-8"
        >
          구매하기
        </Button>
      </div>
    </div>
  );
}
