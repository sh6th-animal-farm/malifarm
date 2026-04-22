interface BrandIconProps {
  size?: number;
  className?: string;
}

export default function BrandIcon({ size = 28, className = "" }: BrandIconProps) {
  return (
    <img
      src="/public_icon.svg"
      alt="마이리틀스마트팜 로고"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      draggable={false}
    />
  );
}
