import type { HTMLAttributes } from "react";

export type IconName = 
  | "leaf" | "bell_on" | "bell_off" | "profile" 
  | "heart_filled" | "search" | "warning" | "home" 
  | "chevron_right" | "trashcan" | "check" | "instagram" 
  | "youtube" | "seedling" | "link" | "user";

export interface IconProps extends HTMLAttributes<SVGElement> {
  name?: IconName;
  size?: number | string;
  color?: string;
  className?: string;
}