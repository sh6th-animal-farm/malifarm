import { Routes, Route } from "react-router-dom";
import "./styles/index.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import NotFound from "./pages/Error/NotFound";
import ProjectDetail from "./pages/project/ProjectDetail";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
