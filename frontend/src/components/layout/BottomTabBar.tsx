import { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/icon";

const tabs = [
  { to: "/", label: "홈", icon: "home" as const, match: ["/"] },
  { to: "/project", label: "프로젝트", icon: "seedling" as const, match: ["/project"] },
  {
    to: "/token",
    label: "토큰 거래소",
    icon: "link" as const,
    match: ["/token"],
    state: { openTokenDetailOnMobile: true },
  },
  { to: "/carbon/list", label: "탄소마켓", icon: "leaf" as const, match: ["/carbon"] },
  { to: "/mypage", label: "내 정보", icon: "user" as const, match: ["/mypage"] },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);

  const isActive = (paths: string[]) =>
    paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  useLayoutEffect(() => {
    const setHeightVar = () => {
      const height = navRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--bottom-tabbar-height", `${height}px`);
    };

    setHeightVar();

    const observer = new ResizeObserver(() => {
      setHeightVar();
    });

    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener("resize", setHeightVar);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", setHeightVar);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-[1100] bg-white shadow-std md:hidden"
    >
      <ul className="flex items-center justify-center gap-x-3 pb-4">
        {tabs.map((tab) => {
          const active = isActive(tab.match);

          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                state={tab.state}
                className={`flex h-14 w-18 flex-col items-center justify-center gap-0.5 ${
                  active ? "text-gray-900" : "text-gray-400"
                }`}
              >
                <Icon name={tab.icon} size={28} color="currentColor" />
                <span className={`${active ? "font-bottom-02" : "font-bottom-01"} leading-none`}>
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
