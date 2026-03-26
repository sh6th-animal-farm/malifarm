import type { IconName, IconProps } from "./iconTypes";
import * as Icons from "./Icons";

const ICON_MAP: Record<IconName, React.ComponentType<IconProps>> = {
  heart_filled: Icons.HeartFilled,
  leaf: Icons.Leaf,
  bell_on: Icons.BellOn,
  bell_off: Icons.BellOff,
  profile: Icons.Profile,
  instagram: Icons.Instagram,
  youtube: Icons.Youtube,
  seedling: Icons.Seedling,
  search: Icons.Search,
  warning: Icons.Warning,
  chevron_right: Icons.ChevronRight,
  link: Icons.LinkIcon,
  trashcan: Icons.Trashcan,
  check: Icons.Check,
  home: Icons.Home,
  user: Icons.User,
  check_circle: Icons.CheckCircle,
  warning_circle: Icons.WarningCircle,
};

interface FinalIconProps extends IconProps {
  name: IconName;
}

export default function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  ...props
}: FinalIconProps) {
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    console.warn(`[Icon] "${name}" 아이콘을 찾을 수 없습니다.`);
    return null;
  }

  return (
    <IconComponent size={size} color={color} className={className} {...props} />
  );
}
