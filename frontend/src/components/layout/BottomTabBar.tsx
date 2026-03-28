import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/icon";

const tabs = [
  { to: "/", label: "홈", icon: "home" as const, match: ["/"] },
  { to: "/project", label: "프로젝트", icon: "seedling" as const, match: ["/project"] },
  { to: "/token", label: "토큰 거래소", icon: "link" as const, match: ["/token"] },
  { to: "/carbon/list", label: "탄소마켓", icon: "leaf" as const, match: ["/carbon"] },
  { to: "/mypage/profile", label: "내 정보", icon: "user" as const, match: ["/mypage"] },
];

export default function BottomTabBar() {
  const location = useLocation();

  const isActive = (paths: string[]) =>
    paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1100] border-t border-gray-100 bg-white/95 backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-1">
        {tabs.map((tab) => {
          const active = isActive(tab.match);

          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 px-1 ${
                  active ? "text-green-600" : "text-gray-400"
                }`}
              >
                <Icon name={tab.icon} size={28} color="currentColor" />
                <span className={`${active ? "font-caption-02" : "font-caption-01"} leading-none`}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
