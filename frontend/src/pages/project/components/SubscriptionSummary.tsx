import Icon from '@/components/icon';

interface SummaryProps {
  thumbnail?: string;
  title: string;
  // 부모가 "1 토큰 당 10,000원" 또는 "현재가 5,000원" 등 전체 문구를 결정해서 전달
  labelText: string;
}

export const SubscriptionSummary = ({
  thumbnail,
  title,
  labelText,
}: SummaryProps) => (
  <div className="flex items-center gap-3.5 bg-gray-50 rounded-[12px] p-3.5 mb-5">
    {/* 썸네일 */}
    {thumbnail ? (
      <img
        src={thumbnail}
        className="w-16 h-16 rounded-lg object-cover"
        alt="thumb"
      />
    ) : (
      <div className="w-16 h-16 rounded-lg bg-green-50 flex items-center justify-center">
        <Icon name="leaf" color="var(--color-green-600)" size={28} />
      </div>
    )}

    <div className="flex flex-col gap-1">
      {/* 제목 */}
      <div className="text-sm font-body-04 text-gray-800">{title}</div>

      {/* 라벨 영역: 전달받은 labelText를 그대로 출력 */}
      <div className="text-green-600 text-sm font-button-02">{labelText}</div>
    </div>
  </div>
);
