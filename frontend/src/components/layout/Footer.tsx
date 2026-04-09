import { Link } from "react-router-dom";
import Icon from "@/components/icon";

export default function Footer() {
  return (
    <footer className="py-10 bg-white border-t border-gray-100 hidden md:block">
      <div className="container">
        <div className="flex flex-wrap">
          {/* 왼쪽 영역: 메뉴 및 기업 정보 */}
          <div className="w-full lg:w-2/3">
            <nav className="flex gap-[44px] mb-6">
              <Link
                to="/"
                className="text-base font-bold text-gray-900 no-underline hover:text-green-600 transition-colors"
              >
                회사 소개
              </Link>
              <Link
                to="/"
                className="text-base font-bold text-gray-900 no-underline hover:text-green-600 transition-colors"
              >
                서비스 소개
              </Link>
              <Link
                to="/policy"
                className="text-base font-bold text-gray-900 no-underline hover:text-green-600 transition-colors"
              >
                서비스 약관
              </Link>
              <Link
                to="/"
                className="text-base font-bold text-gray-900 no-underline hover:text-green-600 transition-colors"
              >
                Q&A
              </Link>
            </nav>

            <div className="text-sm leading-[1.6] text-gray-400">
              상호명: (주)마이리틀스마트팜 | 대표자: 홍길동 | 사업자등록번호:
              123-45-67890
              <br />
              주소: 서울특별시 강남구 테헤란로 123 팜타워 15층
              <br />
              통신판매업신고: 제 2026-서울강남-01234호
            </div>
          </div>

          {/* 오른쪽 영역: 로고 및 SNS */}
          <div className="w-full lg:w-1/3 flex flex-col items-end justify-end gap-[2px] text-right">
            <div className="text-[20px] font-bold text-gray-900">
              마이리틀<span className="text-green-600">스마트팜</span>
            </div>

            <div className="flex justify-end gap-3">
              <a
                href="/"
                rel="noopener noreferrer"
                className="h-6 text-gray-600 transition-colors duration-200 hover:text-red-600"
              >
                <Icon name="instagram" size={24} />
              </a>
              <a
                href="/"
                rel="noopener noreferrer"
                className="h-6 text-gray-600 transition-colors duration-200 hover:text-red-600"
              >
                <Icon name="youtube" size={24} />
              </a>
            </div>

            <div className="copyright">© 2026 My Little SmartFarm.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
