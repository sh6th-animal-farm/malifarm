import { Outlet } from "react-router-dom";
import Sidebar from "@/pages/mypage/components/Sidebar";

export default function MyPage() {
  return (
    <section className="bg-gray-50">
      <div className="layout-container min-h-content py-4 md:py-20">
        <div className="grid gap-5 md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
