import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "@/api/authApi.ts";
import Icon from "@/components/icon";

export default function Header() {
  const location = useLocation();
  const [isLogIn, setIsLogIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 로그인 상태 및 사용자 정보 초기화
  useEffect(() => {
    // 1. 로컬 스토리지에서 액세스 토큰 불러오기
    //  -> 로그인 정보 상태 업데이트
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setIsLogIn(false);
      return;
    }

    setIsLogIn(true);

    // 2. 로컬 스토리지에서 사용자 이름 및 권한 불러오기
    //  -> 사용자 정보 상태 업데이트
    const cachedName = localStorage.getItem("userName");
    const cachedRole = localStorage.getItem("userRole");

    if (cachedName) setUserName(cachedName);
    if (cachedRole) setUserRole(cachedRole);

    // 3. DB에서 사용자 정보 조회
    // -> 로컬 스토리지 및 상태 업데이트
    const fetchUserData = async () => {
      try {
        if (!cachedName) {
          const name = await authApi.getUserName();
          setUserName(name || "사용자");
          localStorage.setItem("userName", name || "사용자");
        }
        if (!cachedRole) {
          const role = await authApi.getUserRole();
          setUserRole(role || "USER");
          localStorage.setItem("userRole", role || "USER");
        }
      } catch (e) {
        console.warn("[Header] 사용자 정보 조회 실패", e);
      }
    };

    fetchUserData();
  }, [location.pathname]); // 경로 변경 시마다 로그인 상태 및 사용자 정보 재확인

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  // 메뉴 활성화 체크 함수
  // const isActive = (path: string) =>
  //   location.pathname.includes(path) ? "active" : "";

  // 활성화 체크 및 Tailwind 클래스 반환
  const getNavItemClass = (path: string) => {
    const baseClass =
      "relative inline-flex flex-col items-center font-body-03 px-5 py-1 text-gray-600 transition-all duration-200 hover:text-gray-900 no-underline";
    const activeClass =
      "text-gray-900 -translate-y-[2px] after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-green-600 after:rounded-[var(--radius-xl)]";
    return location.pathname.includes(path)
      ? `${baseClass} ${activeClass}`
      : baseClass;
  };

  return (
    <header className="h-header-height bg-white/85 border-b border-gray-100 sticky top-0 z-[1000] flex items-center">
      <div className="container flex items-center justify-between w-full h-full">
        {/* 로고 영역 */}
        <Link
          to="/"
          className="font-subtitle-01 text-gray-900 flex items-center overflow-hidden whitespace-nowrap cursor-pointer"
        >
          <Icon
            name="leaf"
            color="var(--color-green-600)"
            size={24}
            className="mr-2"
          />
          <span className="keep">마이리틀</span>
          <span className="text-green-600">스마트팜</span>
        </Link>

        {/* 네비게이션 영역 */}
        <nav>
          <ul className="flex list-none gap-1">
            <li>
              <Link to="/project" className={getNavItemClass("/project")}>
                프로젝트 목록
              </Link>
            </li>
            <li>
              <Link to="/token" className={getNavItemClass("/token")}>
                토큰 거래소
              </Link>
            </li>
            <li>
              <Link to="/carbon" className={getNavItemClass("/carbon")}>
                탄소 마켓
              </Link>
            </li>
            <li>
              <Link to="/notice" className={getNavItemClass("/notice")}>
                공지사항
              </Link>
            </li>
          </ul>
        </nav>

        {/* 로그인/회원가입 또는 알림/프로필 영역 */}
        <div className="flex items-center gap-6" ref={dropdownRef}>
          {!isLogIn ? (
            /* 로그인 안 한 사용자 */
            <div className="flex items-center gap-6">
              <Link to="/auth/login" className="text-gray-900 font-button-01">
                로그인
              </Link>
              <Link
                to="/auth/signup"
                className="px-3 py-1 width-[72px] height-[32px] bg-green-600 text-white inline-flex items-center justify-center font-button-01 transition-all duration-200 rounded-[var(--radius-s)] border overflow-hidden whitespace-nowrap"
              >
                회원가입
              </Link>
            </div>
          ) : (
            /* 로그인 한 사용자 */
            <div className="flex items-center gap-[18px] relative">
              {/* 알림 드롭다운 */}
              <div className="relative inline-block">
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer p-0 flex items-center outline-none"
                  onClick={(e) => toggleDropdown("noti", e)}
                >
                  <Icon name="bell_off" />
                </button>
                <div
                  className={`
                    absolute top-[calc(100%+12px)] right-0 flex w-full px-6 py-3 text-center
                    bg-white min-w-[180px] shadow-std rounded-[var(--radius-s)] z-[1000]
                    ${openDropdown === "noti" ? "!block" : "hidden"}
                  `}
                >
                  <p className="font-body-01 text-gray-300">알림이 없습니다.</p>
                </div>
              </div>

              {/* 프로필 드롭다운 */}
              <div className="relative inline-block">
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer p-0 flex items-center outline-none"
                  onClick={(e) => toggleDropdown("profile", e)}
                >
                  <Icon name="profile" />
                </button>
                <div
                  className={`
                    absolute top-[calc(100%+12px)] right-0 flex flex-col w-full py-2 
                    bg-white min-w-[180px] shadow-std rounded-[var(--radius-s)] z-[1000]
                    ${openDropdown === "profile" ? "block" : "hidden"}
                  `}
                >
                  <div className="px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600">
                    <Link to="/mypage/profile">내 정보</Link>
                  </div>
                  <div className="px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600">
                    <Link to="/mypage/project-history">나의 프로젝트</Link>
                  </div>
                  <div className="px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600">
                    <Link to="/mypage/wallet">나의 전자지갑</Link>
                  </div>
                  <div className="px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600">
                    <Link to="/mypage/transaction-history">거래 내역</Link>
                  </div>

                  {/* ADMIN 권한인 사용자만 표시 */}
                  {userRole === "ADMIN" && (
                    <div className="px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600">
                      <Link to="/admin">관리자 페이지</Link>
                    </div>
                  )}

                  {userRole === "ENTERPRISE" && (
                    <div className="px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600">
                      <Link to="/mypage/carbon-history">
                        탄소 배출권 구매 내역
                      </Link>
                    </div>
                  )}

                  <div className="px-4 py-2.5 font-caption-01 text-error hover:bg-gray-50 hover:text-error">
                    <button onClick={handleLogout}>로그아웃</button>
                  </div>
                </div>
              </div>

              <span className="font-button-01">{userName} 님</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
