import { Routes, Route } from "react-router-dom";
import "./styles/index.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/home";
import Login from "./pages/auth/Login";
import NotFound from "./pages/error/NotFound";
import ProjectDetail from "./pages/project/ProjectDetail";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
