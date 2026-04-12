import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveMenu = () => {
    if (location.pathname.includes('/admin/project')) return 'project';
    if (location.pathname.includes('/admin/farm')) return 'farm';
    if (location.pathname.includes('/admin/cultivation')) return 'cultivation';
    if (location.pathname.includes('/admin/revenue')) return 'income';
    if (location.pathname.includes('/admin/expense')) return 'expense';
    return '';
  };

  const activeMenu = getActiveMenu();

  return (
    <nav className="sidebar">
      <div className="logo">
        마이리틀 스마트팜
        <br />
        Admin
      </div>
      <a
        href="#"
        className={`menu-item ${activeMenu === 'project' ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          navigate('/admin/project');
        }}
      >
        프로젝트 등록/수정
      </a>
      <a
        href="#"
        className={`menu-item ${activeMenu === 'farm' ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          navigate('/admin/farm');
        }}
      >
        농장 등록/수정
      </a>
      <a
        href="#"
        className={`menu-item ${activeMenu === 'cultivation' ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          navigate('/admin/cultivation');
        }}
      >
        재배 정보 입력
      </a>
      <a
        href="#"
        className={`menu-item ${activeMenu === 'income' ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          navigate('/admin/revenue');
        }}
      >
        수익 정보 입력
      </a>
      <a
        href="#"
        className={`menu-item ${activeMenu === 'expense' ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          navigate('/admin/expense');
        }}
      >
        지출 정보 입력
      </a>

      <div className="sidebar-footer">
        <a
          href="#"
          className="menu-item home-link"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="9,22 9,12 15,12 15,22"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>사용자 홈으로</span>
        </a>
      </div>
    </nav>
  );
};

export default AdminSidebar;
