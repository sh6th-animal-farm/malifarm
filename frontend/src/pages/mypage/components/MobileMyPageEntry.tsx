import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Icon from "@/components/icon";
import Badge from "@/components/common/Badge";
import { myPageApi } from "@/api/myPageApi";
import type { ProfileDTO } from "@/types/myPageType";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const menuItems = [
  {
    to: "/mypage/profile",
    label: "내 정보 관리",
  },
  {
    to: "/mypage/project-history",
    label: "나의 프로젝트",
  },
  {
    to: "/mypage/wallet",
    label: "나의 전자지갑",
  },
  {
    to: "/mypage/transaction-history",
    label: "거래 내역",
  },
  {
    to: "/mypage/carbon-history",
    label: "탄소 배출권 구매 내역",
  },
];

export default function MobileMyPageEntry() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDTO | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") ?? "");
  }, []);

  useEffect(() => {
    if (isDesktop) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await myPageApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("모바일 내 정보 로딩 실패:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isDesktop]);

  const items = useMemo(
    () =>
      menuItems.filter((item) => {
        if (item.to !== "/mypage/carbon-history") return true;
        return ["SYSTEM", "ADMIN", "ENTERPRISE"].includes(userRole);
      }),
    [userRole],
  );

  if (isDesktop) {
    return <Navigate to="/mypage/profile" replace />;
  }

  return (
    <div className="layout-container py-4">
      <div className="mb-4 rounded-lg bg-white p-4 shadow-std">
        <div className="flex flex-wrap items-center gap-3">
          <strong className="font-header-03 text-gray-900">
            {loading ? "불러오는 중..." : profile?.userName ?? "-"}
          </strong>
          <Badge
            variant="info"
            width="auto"
            height={28}
            className="cursor-default select-none rounded-full"
          >
            {profile?.investorType ?? "General Investor"}
          </Badge>
        </div>
        <p className="mt-2 font-caption-01 text-gray-500">
          가입일: {profile?.createdAt ? profile.createdAt.slice(0, 10) : "-"}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white p-4 shadow-std">
        <div>
          <h3 className="font-caption-02 text-gray-400">서비스</h3>
        </div>
        <div className="mt-2">
          {items.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center justify-between rounded-xl pt-3 transition-colors duration-200 hover:bg-gray-50 ${
                index === items.length - 1 ? "pb-1" : "pb-3"
              }`}
            >
              <div className="min-w-0">
                <p className="font-body-03 text-gray-900">{item.label}</p>
              </div>
              <Icon
                name="chevron_right"
                size={14}
                className="shrink-0 text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gray-500"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
