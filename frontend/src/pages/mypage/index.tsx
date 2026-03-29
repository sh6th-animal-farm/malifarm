import { Outlet } from "react-router-dom";
import Sidebar from "@/pages/mypage/components/Sidebar";

export default function MyPage() {
  return (
    <section className="bg-gray-50">
      <div className="layout-container pb-20 pt-6 md:pt-8 min-h-[calc(100vh-var(--spacing-header-height))]">
        <div className="grid gap-5 md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
