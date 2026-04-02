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

export default function useSessionExpireText() {
  const [remainMs, setRemainMs] = useState(0);

  useEffect(() => {
    const updateRemain = () => {
      const lastActivityTime = Number(localStorage.getItem("lastActivityTime") || 0);

      if (!lastActivityTime) {
        setRemainMs(0);
        return;
      }

      const expireAt = lastActivityTime + LOGOUT_TIME;
      const remain = Math.max(expireAt - Date.now(), 0);
      setRemainMs(remain);
    };

    updateRemain();
    const timer = window.setInterval(updateRemain, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const sessionExpireText = useMemo(() => {
    if (remainMs <= 0) return "세션 만료";
    return ` ${formatRemain(remainMs)}`;
  }, [remainMs]);

  return {
    remainMs,
    sessionExpireText,
    isExpired: remainMs <= 0,
  };
}