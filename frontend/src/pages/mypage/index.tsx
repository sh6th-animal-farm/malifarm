import { Outlet } from "react-router-dom";
import Sidebar from "@/pages/mypage/components/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function MyPage() {

  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    isMobile ? (
      <div className="flex h-[var(--custom-calc-height)] flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </div>
      </div>
    ) : (
    <div className="layout-container min-h-content py-4 md:py-20">
      <div className="grid gap-5 md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <Outlet />
      </div>
    </div>
    )
  );
}
