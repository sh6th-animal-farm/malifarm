import { useEffect, useMemo, useState } from "react";

const LOGOUT_TIME = 3 * 60 * 60 * 1000; // 3시간

function formatRemain(ms: number) {
  const totalSec = Math.max(Math.floor(ms / 1000), 0);
  const hour = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;

  if (hour > 0) {
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function forceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("loginStartTime");
  localStorage.removeItem("lastActivityTime");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
}

export default function useSessionExpireText() {
  const [remainMs, setRemainMs] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const updateRemain = () => {
      const token = localStorage.getItem("accessToken");
      const lastActivityTime = Number(localStorage.getItem("lastActivityTime") || 0);

      if (!token) {
        setRemainMs(0);
        setIsInitialized(true);
        return;
      }

      if (!lastActivityTime) {
        setRemainMs(LOGOUT_TIME); // 최소한 첫 진입 즉시 만료 처리하지 않음
        setIsInitialized(true);
        return;
      }

      const expireAt = lastActivityTime + LOGOUT_TIME;
      const remain = Math.max(expireAt - Date.now(), 0);
      setRemainMs(remain);
      setIsInitialized(true);
    };

    updateRemain();
    const timer = window.setInterval(updateRemain, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!isInitialized) return;

    if (token && remainMs <= 0) {
      forceLogout();
      window.location.href = "/auth/login";
    }
  }, [remainMs, isInitialized]);

  const sessionExpireText = useMemo(() => {
    if (!isInitialized) return "";
    if (remainMs <= 0) return "세션 만료";
    return formatRemain(remainMs);
  }, [remainMs, isInitialized]);

  return {
    remainMs,
    sessionExpireText,
    isExpired: isInitialized && remainMs <= 0,
  };
}