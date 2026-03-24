import type { IconProps } from "../iconTypes";

export default function ChevronRight({ size, color, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" {...props}>
      <path fill={color} d="M222.1 145.1C212.7 135.7 212.7 120.5 222.1 111.1C231.5 101.7 246.7 101.7 256.1 111.1L456.1 311.1C465.5 320.5 465.5 335.7 456.1 345.1L256.1 545.1C246.7 554.5 231.5 554.5 222.1 545.1C212.7 535.7 212.7 520.5 222.1 511.1L394.1 328.1L222.1 145.1z"/>
    </svg>
  );
}