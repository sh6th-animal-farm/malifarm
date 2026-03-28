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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

    const isActive =
      location.pathname === path || location.pathname.startsWith(`${path}/`);

    return isActive
      ? `${baseClass} ${activeClass}`
      : baseClass;
  };

  return (
    <header className="h-header-height bg-white/85 border-b border-gray-100 sticky top-0 z-[1000] flex items-center">
      <div className="layout-container relative flex h-full items-center justify-between">
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
        <nav className="hidden lg:block">
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
              <Link to="/carbon/list" className={getNavItemClass("/carbon")}>
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
        <div className="hidden items-center gap-5 lg:flex" ref={dropdownRef}>
          {!isLogIn ? (
            /* 로그인 안 한 사용자 */
            <div className="flex items-center gap-5">
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
            <div className="relative flex items-center gap-3">
              <span className="font-button-02 text-gray-700">{userName} 님</span>
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
                    absolute top-[calc(100%+12px)] right-0 flex w-full flex-col overflow-hidden
                    bg-white min-w-[180px] shadow-std rounded-[var(--radius-s)] z-[1000]
                    ${openDropdown === "profile" ? "block" : "hidden"}
                  `}
                >
                  <Link
                    to="/mypage/profile"
                    className="block w-full px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  >
                    내 정보
                  </Link>
                  <Link
                    to="/mypage/project-history"
                    className="block w-full px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  >
                    나의 프로젝트
                  </Link>
                  <Link
                    to="/mypage/wallet"
                    className="block w-full px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  >
                    나의 전자지갑
                  </Link>
                  <Link
                    to="/mypage/transaction-history"
                    className="block w-full px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  >
                    거래 내역
                  </Link>

                  {/* ADMIN 권한인 사용자만 표시 */}
                  {userRole === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="block w-full px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                      관리자 페이지
                    </Link>
                  )}

                  {userRole === "ENTERPRISE" && (
                    <Link
                      to="/mypage/carbon-history"
                      className="block w-full px-4 py-2.5 font-caption-01 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    >
                      탄소 배출권 구매 내역
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full cursor-pointer px-4 py-2.5 text-left font-caption-01 text-error hover:bg-gray-50 hover:text-red-700"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden" ref={dropdownRef}>
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--radius-s)] border border-gray-100 bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen((prev) => !prev);
            }}
            aria-label="모바일 메뉴"
            aria-expanded={mobileMenuOpen}
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 top-0 h-[2px] w-full rounded bg-gray-700 transition-transform duration-200 ${
                  mobileMenuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[2px] w-full rounded bg-gray-700 transition-opacity duration-200 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-[2px] w-full rounded bg-gray-700 transition-transform duration-200 ${
                  mobileMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1000] rounded-[var(--radius-m)] border border-gray-100 bg-white p-4 shadow-std lg:hidden">
            <nav>
              <ul className="flex list-none flex-col gap-1">
                <li>
                  <Link
                    to="/project"
                    className="block rounded-[var(--radius-s)] px-3 py-2 font-body-02 text-gray-700 hover:bg-gray-50"
                  >
                    프로젝트 목록
                  </Link>
                </li>
                <li>
                  <Link
                    to="/token"
                    className="block rounded-[var(--radius-s)] px-3 py-2 font-body-02 text-gray-700 hover:bg-gray-50"
                  >
                    토큰 거래소
                  </Link>
                </li>
                <li>
                  <Link
                    to="/carbon/list"
                    className="block rounded-[var(--radius-s)] px-3 py-2 font-body-02 text-gray-700 hover:bg-gray-50"
                  >
                    탄소 마켓
                  </Link>
                </li>
                <li>
                  <Link
                    to="/notice"
                    className="block rounded-[var(--radius-s)] px-3 py-2 font-body-02 text-gray-700 hover:bg-gray-50"
                  >
                    공지사항
                  </Link>
                </li>
              </ul>
            </nav>

            {!isLogIn ? (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center rounded-[var(--radius-s)] border border-gray-200 px-3 py-2 font-button-02 text-gray-700"
                >
                  로그인
                </Link>
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center justify-center rounded-[var(--radius-s)] bg-green-600 px-3 py-2 font-button-02 text-white"
                >
                  회원가입
                </Link>
              </div>
            ) : (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="px-3 pb-2 font-caption-01 text-gray-400">{userName} 님</p>
                <div className="flex flex-col">
                  <Link
                    to="/mypage/profile"
                    className="rounded-[var(--radius-s)] px-3 py-2 font-caption-01 text-gray-700 hover:bg-gray-50"
                  >
                    내 정보
                  </Link>
                  {userRole === "ADMIN" ? (
                    <Link
                      to="/admin"
                      className="rounded-[var(--radius-s)] px-3 py-2 font-caption-01 text-gray-700 hover:bg-gray-50"
                    >
                      관리자 페이지
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="cursor-pointer rounded-[var(--radius-s)] px-3 py-2 text-left font-caption-01 text-error hover:bg-gray-50 hover:text-red-700"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
