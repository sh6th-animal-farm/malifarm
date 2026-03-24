import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "../../api/authApi.ts";
import Icon from "../icon/index.tsx";

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
  }, []);

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
  const isActive = (path: string) =>
    location.pathname.includes(path) ? "active" : "";

  return (
    <header className="h-header-height bg-white/85 border-b border-gray-100 sticky top-0 z-[1000] flex items-center">
      <div className="container flex items-center justify-between h-full px-gutter">
        {/* 로고 영역 */}
        <Link
          to="/"
          className="logo-text font-subtitle-01 text-gray-900 flex items-center overflow-hidden whitespace-nowrap cursor-pointer"
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
          <ul className="nav-list flex list-none gap-1">
            <li>
              <Link
                to="/project"
                className={`nav-item ${isActive("/project")}`}
              >
                프로젝트 목록
              </Link>
            </li>
            <li>
              <Link to="/token" className={`nav-item ${isActive("/token")}`}>
                토큰 거래소
              </Link>
            </li>
            <li>
              <Link to="/carbon" className={`nav-item ${isActive("/carbon")}`}>
                탄소 마켓
              </Link>
            </li>
            <li>
              <Link to="/notice" className={`nav-item ${isActive("/notice")}`}>
                공지사항
              </Link>
            </li>
          </ul>
        </nav>

        {/* 로그인/회원가입 또는 알림/프로필 영역 */}
        <div className="auth-group flex items-center gap-4" ref={dropdownRef}>
          {!isLogIn ? (
            /* 로그인 안 한 사용자 */
            <div className="flex items-center gap-6">
              <Link
                to="/auth/login"
                className="btn-login font-button-02 text-gray-900 no-underline"
              >
                로그인
              </Link>
              <Link
                to="/auth/signup"
                className="btn-signup bg-green-600 text-white px-3 py-1 rounded-s font-button-02 no-underline transition-colors duration-200 hover:bg-green-700"
              >
                회원가입
              </Link>
            </div>
          ) : (
            /* 로그인 한 사용자 */
            <div className="flex items-center gap-4">
              {/* 알림 드롭다운 */}
              <div className="relative">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-900"
                  onClick={(e) => toggleDropdown("noti", e)}
                >
                  <Icon name="bell_on" />
                </button>
                <div
                  className={`dropdown-content w-64 ${openDropdown === "noti" ? "show" : ""}`}
                >
                  <p className="py-4 text-center text-gray-400 font-caption-01">
                    알림이 없습니다.
                  </p>
                </div>
              </div>

              {/* 프로필 드롭다운 */}
              <div className="relative">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-900"
                  onClick={(e) => toggleDropdown("profile", e)}
                >
                  <Icon name="profile" />
                </button>
                <div
                  className={`dropdown-content ${openDropdown === "profile" ? "show" : ""}`}
                >
                  <Link
                    to="/mypage/profile"
                    className="block px-4 py-2 hover:bg-gray-50"
                  >
                    내 정보
                  </Link>
                  <Link
                    to="/mypage/project-history"
                    className="block px-4 py-2 hover:bg-gray-50"
                  >
                    나의 프로젝트
                  </Link>
                  <Link
                    to="/mypage/wallet"
                    className="block px-4 py-2 hover:bg-gray-50"
                  >
                    나의 전자지갑
                  </Link>
                  <Link
                    to="/mypage/transaction-history"
                    className="block px-4 py-2 hover:bg-gray-50"
                  >
                    거래 내역
                  </Link>

                  {/* ADMIN 권한인 사용자만 표시 */}
                  {userRole === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-blue-600 hover:bg-gray-50 border-t border-gray-100 mt-1"
                    >
                      관리자 페이지
                    </Link>
                  )}

                  {userRole === "ENTERPRISE" && (
                    <Link
                      to="/mypage/carbon-history"
                      className="block px-4 py-2 text-blue-600 hover:bg-gray-50 border-t border-gray-100 mt-1"
                    >
                      탄소 배출권 구매 내역
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-error hover:bg-gray-50 border-t border-gray-100 mt-1"
                  >
                    로그아웃
                  </button>
                </div>
              </div>

              <span className="font-body-03 text-gray-800 ml-2">
                {userName} 님
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
