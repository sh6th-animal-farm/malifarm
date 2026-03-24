import { Link } from "react-router-dom";
import Icon from "../icon";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="flex flex-wrap">
          {/* 왼쪽 영역: 메뉴 및 기업 정보 */}
          <div className="w-full lg:w-2/3">
            <nav className="footer-top-menu">
              <Link to="/">회사 소개</Link>
              <Link to="/">서비스 소개</Link>
              <Link to="/policy">서비스 약관</Link>
              <Link to="/">Q&A</Link>
            </nav>

            <div className="footer-info-text">
              상호명: (주)마이리틀스마트팜 | 대표자: 홍길동 | 사업자등록번호:
              123-45-67890
              <br />
              주소: 서울특별시 강남구 테헤란로 123 팜타워 15층
              <br />
              통신판매업신고: 제 2026-서울강남-01234호
            </div>
          </div>

          {/* 오른쪽 영역: 로고 및 SNS */}
          <div className="w-full lg:w-1/3 footer-right">
            <div className="footer-logo">
              마이리틀<span>스마트팜</span>
            </div>

            <div className="sns-group">
              <a
                href="/"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                <Icon name="instagram" size={24} />
              </a>
              <a
                href="/"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors"
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
