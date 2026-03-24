import type { IconName, IconProps } from "./iconTypes";
import HeartFilled from "./icons/HeartFilled";
import Leaf from "./icons/leaf";
import BellOn from "./icons/BellOn";
import BellOff from "./icons/BellOff";
import Profile from "./icons/Profile";
import Instagram from "./icons/Instagram";
import Youtube from "./icons/Youtube";
import Seedling from "./icons/Seedling";
import Search from "./icons/Search";
import Warning from "./icons/Warning";
import ChevronRight from "./icons/ChevronRight";
import Link from "./icons/Link";
import Trashcan from "./icons/Trashcan";
import Check from "./icons/Check";
import Home from "./icons/Home";
import User from "./icons/User";

const ICON_MAP: Record<IconName, React.ComponentType<IconProps>> = {
  heart_filled: HeartFilled,
  leaf: Leaf,
  bell_on: BellOn,
  bell_off: BellOff,
  profile: Profile,
  instagram: Instagram,
  youtube: Youtube,
  seedling: Seedling,
  search: Search,
  warning: Warning,
  chevron_right: ChevronRight,
  link: Link,
  trashcan: Trashcan,
  check: Check,
  home: Home,
  user: User,
};

export default function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  ...props
}: IconProps) {
  const IconComponent = name ? ICON_MAP[name] : null;

  if (!IconComponent) return null;

  return (
    <IconComponent size={size} color={color} className={className} {...props} />
  );
}
