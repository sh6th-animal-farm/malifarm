import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomTabBar from './components/layout/BottomTabBar';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import NotFound from './pages/Error/NotFound';
import ProjectDetail from './pages/project/ProjectDetail';
import TokenList from './pages/Token/TokenList';
import TokenDetail from './pages/Token/TokenDetail';
import CarbonList from './pages/Carbon/CarbonList';
import CarbonDetail from './pages/Carbon/CarbonDetail';
import MyPage from './pages/mypage';
import ProfileLayout from './pages/mypage/components/myProfile/ProfileLayout';
import ProjectLayout from './pages/mypage/components/myProject/ProjectLayout';
import WalletLayout from './pages/mypage/components/myWallet/WalletLayout';
import TransactionLayout from './pages/mypage/components/myTransaction/TransactionLayout';
import CarbonLayout from './pages/mypage/components/myCarbon/CarbonLayout';
import ProjectList from './pages/project/ProjectList';
import {
  CultivationRegister,
  ExpenseRegister,
  FarmRegister,
  ProjectRegister,
  RevenueRegister,
} from '@/pages/admin';

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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="content-wrapper pb-16 md:pb-0">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project" element={<ProjectList />} />
          <Route path="/token" element={<TokenList />} />
          <Route path="/token/:id" element={<TokenDetail />} />
          <Route path="/carbon/list" element={<CarbonList />} />
          <Route path="/carbon/:id" element={<CarbonDetail />} />
          <Route path="/mypage" element={<MyPage />}>
            <Route index element={<Navigate to="profile" replace />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <BottomTabBar />
      <Footer />
    </div>
  );
}

export default App;
