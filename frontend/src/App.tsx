import { Routes, Route } from "react-router-dom";
import "./styles/index.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import NotFound from "./pages/Error/NotFound";
import CarbonList from "./pages/Carbon/CarbonList";
import CarbonDetail from "./pages/Carbon/CarbonDetail";

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
