import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi.ts';
import Icon from '@/components/icon';
import BrandIcon from '@/components/common/BrandIcon';
import userSession from '@/pages/auth/hook/userSession';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLogIn, setIsLogIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { sessionExpireText } = userSession();

  // 컴포넌트 마운트 시 로그인 상태 및 사용자 정보 초기화
  useEffect(() => {
    setIsLoading(true);

    // 1. 로컬 스토리지에서 액세스 토큰 불러오기
    //  -> 로그인 정보 상태 업데이트
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setIsLogIn(false);
      setUserName('');
      setUserRole('');
      setIsLoading(false);
      return;
    }

    setIsLogIn(true);

    // 2. 로컬 스토리지에서 사용자 이름 및 권한 불러오기
    //  -> 사용자 정보 상태 업데이트
    const cachedName = localStorage.getItem('userName');
    const cachedRole = localStorage.getItem('userRole');

    if (cachedName) setUserName(cachedName);
    if (cachedRole) setUserRole(cachedRole);

    // 3. DB에서 사용자 정보 조회
    // -> 로컬 스토리지 및 상태 업데이트
    const fetchUserData = async () => {
      try {
        if (!cachedName) {
          const name = await authApi.getUserName();
          setUserName(name || '사용자');
          localStorage.setItem('userName', name || '사용자');
        }
        if (!cachedRole) {
          const role = await authApi.getUserRole();
          setUserRole(role || 'USER');
          localStorage.setItem('userRole', role || 'USER');
        }
      } catch (e) {
        console.warn('[Header] 사용자 정보 조회 실패', e);
      } finally {
        setIsLoading(false);
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
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  // 메뉴 활성화 체크 함수
  // const isActive = (path: string) =>
  //   location.pathname.includes(path) ? "active" : "";

  // 활성화 체크 및 Tailwind 클래스 반환
  const getNavItemClass = (path: string) => {
    const baseClass =
      'relative inline-flex flex-col items-center px-5 py-1 font-body-03 text-gray-700 transition-all duration-200 hover:text-gray-900 no-underline';
    const activeClass =
      "text-gray-900 -translate-y-[2px] after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-green-600 after:rounded-[var(--radius-xl)]";

    const isActive =
      location.pathname === path || location.pathname.startsWith(`${path}/`);

    return isActive ? `${baseClass} ${activeClass}` : baseClass;
  };

  const getMobileHeaderTitle = () => {
    const path = location.pathname;
    const mobileTokenTab =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('mobile-token-detail-tab')
        : null;
    if (path === '/') return '홈';
    if (/^\/project\/\d+$/.test(path)) {
      return (
        sessionStorage.getItem('mobile-project-detail-title') || '프로젝트 상세'
      );
    }
    if (/^\/token\/\d+$/.test(path)) {
      if (mobileTokenTab === 'list') return '토큰 거래소';
      return (
        sessionStorage.getItem('mobile-token-detail-title') || '토큰 거래소'
      );
    }
    if (/^\/carbon\/\d+$/.test(path)) {
      return sessionStorage.getItem('mobile-carbon-detail-title') || '탄소마켓';
    }
    if (path.startsWith('/project')) return '프로젝트';
    if (path.startsWith('/token')) return '토큰 거래소';
    if (path.startsWith('/carbon')) return '탄소 마켓';
    if (path.startsWith('/news')) return '뉴스';
    if (path.startsWith('/notice')) return '뉴스';
    if (path.startsWith('/auth/login')) return '로그인';
    if (path.startsWith('/auth/signup')) return '회원가입';
    if (path.startsWith('/mypage/profile')) return '내 정보 관리';
    if (path.startsWith('/mypage/project-history')) return '나의 프로젝트';
    if (path.startsWith('/mypage/wallet')) return '나의 전자지갑';
    if (path.startsWith('/mypage/transaction-history')) return '거래 내역';
    if (path.startsWith('/mypage/carbon-history'))
      return '탄소 배출권 구매 내역';
    if (path === '/mypage') return '내 정보';
    return '마이리틀스마트팜';
  };

  const showMyPageMobileBackButton = location.pathname.startsWith('/mypage/');
  const showProjectDetailMobileBackButton = /^\/project\/\d+$/.test(
    location.pathname,
  );
  const showTokenDetailMobileBackButton =
    /^\/token\/\d+$/.test(location.pathname) &&
    (typeof window === 'undefined' ||
      sessionStorage.getItem('mobile-token-detail-tab') !== 'list');
  const showCarbonDetailMobileBackButton = /^\/carbon\/\d+$/.test(
    location.pathname,
  );
  const showMobileBackButton =
    showMyPageMobileBackButton ||
    showProjectDetailMobileBackButton ||
    showTokenDetailMobileBackButton ||
    showCarbonDetailMobileBackButton;
  const isMobileImageHeroRoute =
    showProjectDetailMobileBackButton || showCarbonDetailMobileBackButton;

  return (
    <header
      className={`z-[1000] flex h-[calc(48px+env(safe-area-inset-top))] items-center touch-manipulation pt-[env(safe-area-inset-top)] transition-colors duration-300 ${
        isMobileImageHeroRoute
          ? 'fixed inset-x-0 top-0 bg-transparent'
          : 'sticky top-0 bg-white'
      } lg:h-[var(--spacing-header-height)] lg:pt-0 lg:bg-white/85 lg:backdrop-blur-md lg:shadow-std lg:fixed lg:inset-x-0 lg:top-0`}
    >
      <div className="relative flex h-full w-full items-center items-center px-4 lg:px-8 xl:px-18">
        {showMobileBackButton && (
          <button
            type="button"
            onClick={() => {
              if (showProjectDetailMobileBackButton) {
                navigate('/project');
                return;
              }
              if (showTokenDetailMobileBackButton) {
                navigate('/token');
                return;
              }
              if (showCarbonDetailMobileBackButton) {
                navigate('/carbon/list');
                return;
              }
              navigate('/mypage');
            }}
            className={`absolute left-0 inline-flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden ${
              isMobileImageHeroRoute ? 'text-white' : 'text-gray-700'
            }`}
            aria-label="뒤로가기"
          >
            <Icon name="chevron_right" size={22} className="rotate-180" />
          </button>
        )}

        {/* 로고 영역 */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            to="/"
            className={`font-header-03 lg:font-subtitle-00 overflow-hidden whitespace-nowrap leading-none text-gray-900 cursor-pointer ${
              location.pathname === '/'
                ? 'inline-flex'
                : 'hidden lg:inline-flex'
            }`}
          >
            <BrandIcon size={40} className="mr-1 self-center" />
            <span className="keep self-center">마이리틀</span>
            <span className="self-center text-green-600">스마트팜</span>
          </Link>

          {!isMobileImageHeroRoute && (
            <div
              className={`${location.pathname === '/' ? 'hidden' : 'block'} text-gray-900 lg:hidden whitespace-nowrap font-header-03
            } ${
              showMobileBackButton ? 'absolute left-1/2 -translate-x-1/2' : ''
            }`}
            >
              {getMobileHeaderTitle()}
            </div>
          )}
        </div>

        {/* 네비게이션 영역 */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
          <ul className="flex list-none gap-1">
            <li>
              <Link to="/project" className={getNavItemClass('/project')}>
                프로젝트 목록
              </Link>
            </li>
            <li>
              <Link to="/token" className={getNavItemClass('/token')}>
                토큰 거래소
              </Link>
            </li>
            <li>
              <Link to="/carbon/list" className={getNavItemClass('/carbon')}>
                탄소 마켓
              </Link>
            </li>
            <li>
              <Link to="/news" className={getNavItemClass('/news')}>
                뉴스
              </Link>
            </li>
          </ul>
        </nav>

        {/* 로그인/회원가입 또는 알림/프로필 영역 */}
        <div className="flex flex-1 items-center justify-end">
          <div className="hidden items-center gap-5 lg:flex" ref={dropdownRef}>
            {isLoading ? (
              /* 로딩 중일 때 영역만 차지*/
              <div className="h-[40px] min-w-[180px]" aria-hidden="true" />
            ) : !isLogIn ? (
              /* 로그인 안 한 사용자 */
              <div className="flex items-center gap-1">
                <Link
                  to="/auth/login"
                  className="cursor-pointer rounded-[var(--radius-s)] px-4 py-1.5 font-caption-03 text-gray-900 transition-colors duration-200 hover:bg-gray-100"
                >
                  로그인
                </Link>
                <Link
                  to="/auth/signup"
                  className="inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-[var(--radius-s)] bg-green-600 px-4 py-1.5 font-caption-03 text-white transition-all duration-200 hover:border-green-700 hover:bg-green-700"
                >
                  회원가입
                </Link>
              </div>
            ) : (
              /* 로그인 한 사용자 */
              <div className="flex items-center gap-[18px] relative">
                {/* 알림 아이콘/드롭다운 비활성화 */}
                {/*
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
                    <p className="font-caption-01 text-gray-300">알림이 없습니다.</p>
                  </div>
                </div>
                */}

                <div className="inline-flex items-center gap-5">
                  <span className="inline-flex h-[30px] w-[106px] items-center justify-between gap-2 rounded-[var(--radius-xl)] bg-gray-50 px-2.5 py-1.5 font-caption-02 text-gray-700 whitespace-nowrap">
                    <Icon
                      name="clock"
                      size={18}
                      color="var(--color-gray-500)"
                    />
                    <span className="tabular-nums">{sessionExpireText}</span>
                  </span>

                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-2 border-none bg-none p-0 text-left text-gray-700 outline-none"
                    onClick={(e) => toggleDropdown('profile', e)}
                  >
                    <Icon
                      name="profile"
                      size={18}
                      color="var(--color-gray-700)"
                    />
                    <span className="font-body-03 whitespace-nowrap">
                      {userName} 님
                    </span>
                  </button>

                  <div
                    className={`
                      absolute top-[calc(100%+12px)] right-0 flex w-max min-w-[180px] flex-col overflow-hidden
                      bg-white shadow-std rounded-[var(--radius-s)] z-[1000]
                      ${openDropdown === 'profile' ? 'block' : 'hidden'}
                    `}
                  >
                    <Link
                      to="/mypage/profile"
                      className="block w-full px-4 py-2.5 font-caption-02 text-gray-700 hover:bg-gray-50 hover:text-green-700"
                    >
                      내 정보
                    </Link>
                    <Link
                      to="/mypage/project-history"
                      className="block w-full px-4 py-2.5 font-caption-02 text-gray-700 hover:bg-gray-50 hover:text-green-700"
                    >
                      나의 프로젝트
                    </Link>
                    <Link
                      to="/mypage/wallet"
                      className="block w-full px-4 py-2.5 font-caption-02 text-gray-700 hover:bg-gray-50 hover:text-green-700"
                    >
                      나의 전자지갑
                    </Link>
                    <Link
                      to="/mypage/transaction-history"
                      className="block w-full px-4 py-2.5 font-caption-02 text-gray-700 hover:bg-gray-50 hover:text-green-700"
                    >
                      거래 내역
                    </Link>

                    {/* ADMIN 권한인 사용자만 표시 */}
                    {userRole === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="block w-full px-4 py-2.5 font-caption-02 text-gray-700 hover:bg-gray-50 hover:text-green-700"
                      >
                        관리자 페이지
                      </Link>
                    )}

                    {userRole === 'ENTERPRISE' && (
                      <Link
                        to="/mypage/carbon-history"
                        className="block w-full px-4 py-2.5 font-caption-02 text-gray-700 hover:bg-gray-50 hover:text-green-700"
                      >
                        탄소 배출권 구매 내역
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full cursor-pointer px-4 py-2.5 text-left font-caption-02 text-error hover:bg-gray-50 hover:text-red-700"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
