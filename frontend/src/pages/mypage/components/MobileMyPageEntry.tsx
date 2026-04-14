import { Navigate } from "react-router-dom";
import MobileMyPageHub from "./MobileMyPageHub";

export default function MobileMyPageEntry() {
  if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
    return <Navigate to="/mypage/profile" replace />;
  }

  return <MobileMyPageHub />;
}
