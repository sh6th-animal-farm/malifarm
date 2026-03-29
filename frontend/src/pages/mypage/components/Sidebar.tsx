import { NavLink } from "react-router-dom";
import Icon from "@/components/icon";

const menuItems = [
  { to: "/mypage/profile", label: "내 정보 관리" },
  { to: "/mypage/project-history", label: "나의 프로젝트" },
  { to: "/mypage/wallet", label: "나의 전자지갑" },
  { to: "/mypage/transaction-history", label: "거래 내역" },
  { to: "/mypage/carbon-history", label: "탄소 배출권 구매 내역" },
];

export default function Sidebar() {
  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `group flex items-center justify-between rounded-lg px-4 py-3.5 transition-colors md:px-5 md:py-4 ${
              isActive
                ? "bg-white font-body-04 text-green-600 shadow-std"
                : "font-body-01 text-gray-500 hover:bg-green-0 hover:text-green-700"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span>{item.label}</span>
              {isActive ? (
                <Icon
                  name="chevron_right"
                  size={16}
                  color="currentColor"
                  className="opacity-80 transition duration-200 group-hover:opacity-100 group-hover:scale-105"
                />
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
