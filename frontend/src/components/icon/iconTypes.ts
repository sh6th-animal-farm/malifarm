import type { HTMLAttributes } from "react";

export type IconName = 
  | "leaf" | "bell_on" | "bell_off" | "profile" 
  | "heart_filled" | "search" | "warning" | "home" 
  | "chevron_right" | "close" | "trashcan" | "check" | "instagram" 
  | "youtube" | "seedling" | "link" | "user"
  | "check_circle" | "warning_circle" | "clock"
  | "price_up" | "price_down";

export interface IconProps extends HTMLAttributes<SVGElement> {
  name?: IconName;
  size?: number | string;
  color?: string;
  className?: string;
}
