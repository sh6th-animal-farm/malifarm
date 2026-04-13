interface InfoItem {
  label: string;
  value: string | number;
  highlight?: boolean;
  fullWidth?: boolean;
}

interface InfoGridProps {
  items: InfoItem[];
}

const InfoBox = ({
  label,
  value,
  highlight = false,
  fullWidth = false,
}: InfoItem) => (
  <div
    className={`
    p-[24px] bg-white rounded-lg
    shadow-std flex flex-col justify-center min-h-[102px] w-full
    ${fullWidth ? 'md:col-span-2' : 'col-span-1'}
  `}
  >
    {/* 테마의 font-caption-02 (500, 14px) 적용 */}
    <label className="font-caption-02 text-gray-400 block mb-2 uppercase tracking-tight">
      {label}
    </label>
    {/* 테마의 font-subtitle-01 (600, 18px) 적용 */}
    <p
      className={`font-subtitle-01 whitespace-pre-wrap ${
        highlight ? 'text-green-500' : 'text-gray-900'
      }`}
    >
      {value}
    </p>
  </div>
);

export default function InfoGrid({ items }: InfoGridProps) {
  return (
    /* 간격은 테마의 gutter(24px)를 사용하거나, 
       기존 CSS의 16px를 유지하려면 gap-[16px]를 사용합니다. */
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] w-full">
      {items.map((item, index) => (
        <InfoBox key={`${item.label}-${index}`} {...item} />
      ))}
    </div>
  );
}
