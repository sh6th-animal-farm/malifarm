import { Routes, Route } from 'react-router-dom';
import './styles/index.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CarbonList from './pages/Carbon/CarbonList';
import CarbonDetail from './pages/Carbon/CarbonDetail';
import Login from './pages/Auth/Login';
import ProjectDetail from './pages/project/ProjectDetail';
import TokenList from './pages/Token/TokenList';
import Home from './pages/Home';
import NotFound from './pages/Error/NotFound';
import ProjectList from './pages/project/ProjectList';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carbon/list" element={<CarbonList />} />
          <Route path="/carbon/:id" element={<CarbonDetail />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project" element={<ProjectList />} />
          <Route path="/token" element={<TokenList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
