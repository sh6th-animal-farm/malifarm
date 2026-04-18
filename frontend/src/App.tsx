import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomTabBar from './components/layout/BottomTabBar';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import NotFound from './pages/Error/NotFound';
import ProjectDetail from './pages/project/ProjectDetail';
import TokenList from './pages/Token/TokenList';
import TokenDetail from './pages/Token/TokenDetail';
import CarbonList from './pages/Carbon/CarbonList';
import CarbonDetail from './pages/Carbon/CarbonDetail';
import News from './pages/news';
import NewsDetail from './pages/news/components/Detail';
import MyPage from './pages/mypage';
import MobileMyPageEntry from './pages/mypage/components/MobileMyPageEntry';
import ProfileLayout from './pages/mypage/components/myProfile/ProfileLayout';
import ProjectLayout from './pages/mypage/components/myProject/ProjectLayout';
import WalletLayout from './pages/mypage/components/myWallet/WalletLayout';
import TransactionLayout from './pages/mypage/components/myTransaction/TransactionLayout';
import CarbonLayout from './pages/mypage/components/myCarbon/CarbonLayout';
import ProjectList from './pages/project/ProjectList';
import DividendPollRoutePage from './pages/project/DividendPollRoutePage';
import {
  CultivationRegister,
  ExpenseRegister,
  FarmRegister,
  ProjectRegister,
  RevenueRegister,
} from '@/pages/admin';
import Policy from '@/pages/Policy/Policy';
import FindPassword from './pages/Auth/components/FindPassword';
import ResetPassword from './pages/Auth/components/ResetPassword';

function App() {
  useEffect(() => {
    let lastSavedTime = 0;

    const updateActivity = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const now = Date.now();
      if (now - lastSavedTime < 30000) return;

      localStorage.setItem('lastActivityTime', String(now));
      lastSavedTime = now;
    };

    const events = ['click', 'keydown', 'scroll'];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);
  return (
    <div className="flex flex-col h-dvh overflow-hidden md:h-auto md:overflow-visible">
      <Header />

      <main className="flex-1 overflow-hidden md:overflow-visible pb-[var(--bottom-tabbar-height)]">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Navigate to="/" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/find-password" element={<FindPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route
            path="/project/dividend/poll"
            element={<DividendPollRoutePage />}
          />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route
            path="/project/:id/dividend-poll"
            element={<DividendPollRoutePage />}
          />
          <Route path="/project" element={<ProjectList />} />
          <Route path="/token" element={<TokenList />} />
          <Route path="/token/:id" element={<TokenDetail />} />
          <Route path="/carbon/list" element={<CarbonList />} />
          <Route path="/carbon/:id" element={<CarbonDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/notice" element={<Navigate to="/news" replace />} />
          <Route path="/notice/:id" element={<Navigate to="/news" replace />} />
          <Route path="/mypage" element={<MyPage />}>
            <Route index element={<MobileMyPageEntry />} />
            <Route path="profile" element={<ProfileLayout />} />
            <Route path="project-history" element={<ProjectLayout />} />
            <Route path="wallet" element={<WalletLayout />} />
            <Route path="transaction-history" element={<TransactionLayout />} />
            <Route path="carbon-history" element={<CarbonLayout />} />
          </Route>
          <Route path="/admin/farm" element={<FarmRegister />} />
          <Route path="/admin/project" element={<ProjectRegister />} />
          <Route path="/admin/cultivation" element={<CultivationRegister />} />
          <Route path="/admin/expense" element={<ExpenseRegister />} />
          <Route path="/admin/revenue" element={<RevenueRegister />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <BottomTabBar />
      <Footer />
    </div>
  );
}

export default App;
