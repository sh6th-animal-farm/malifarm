import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import BottomTabBar from "./components/layout/BottomTabBar";
import ScrollToTop from "./components/layout/ScrollToTop";
import CarbonList from "./pages/Carbon/CarbonList";
import CarbonDetail from "./pages/Carbon/CarbonDetail";
import ProjectDetail from "./pages/project/ProjectDetail";
import TokenList from "./pages/Token/TokenList";
import Login from "./pages/auth/Login";
import NotFound from "./pages/error/NotFound";
import MyPage from "./pages/mypage";
import ProfileLayout from "./pages/mypage/components/myProfile/ProfileLayout";
import ProjectLayout from "./pages/mypage/components/myProject/ProjectLayout";
import WalletLayout from "./pages/mypage/components/myWallet/WalletLayout";
import TransactionLayout from "./pages/mypage/components/myTransaction/TransactionLayout";
import CarbonLayout from "./pages/mypage/components/myCarbon/CarbonLayout";
import Home from "./pages/home";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="content-wrapper pb-16 md:pb-0">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project" element={<NotFound />} />
          <Route path="/token" element={<TokenList />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/mypage" element={<MyPage />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileLayout />} />
            <Route path="project-history" element={<ProjectLayout />} />
          <Route path="wallet" element={<WalletLayout />} />
            <Route path="transaction-history" element={<TransactionLayout />} />
            <Route path="carbon-history" element={<CarbonLayout />} />
          </Route>
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/carbon/list" element={<CarbonList />} />
          <Route path="/carbon/:id" element={<CarbonDetail />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/token" element={<TokenList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <BottomTabBar />
      <Footer />
    </div>
  );
}

export default App;
