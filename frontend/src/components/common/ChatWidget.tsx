import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/icon";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

type ChatRole = "bot" | "user";

interface ChatMessage {
  id: number;
  role: ChatRole;
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: "bot",
    text: "안녕하세요. 무엇을 도와드릴까요?",
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const closeTimerRef = useRef<number | null>(null);
  const openRafRef = useRef<number | null>(null);
  const openRaf2Ref = useRef<number | null>(null);
  const lastSentRef = useRef<{ text: string; at: number } | null>(null);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (openRafRef.current) {
      window.cancelAnimationFrame(openRafRef.current);
      openRafRef.current = null;
    }
    if (openRaf2Ref.current) {
      window.cancelAnimationFrame(openRaf2Ref.current);
      openRaf2Ref.current = null;
    }

    if (isOpen) {
      setShouldRenderPanel(true);
      setIsPanelVisible(false);
      openRafRef.current = window.requestAnimationFrame(() => {
        openRaf2Ref.current = window.requestAnimationFrame(() => {
          setIsPanelVisible(true);
          openRaf2Ref.current = null;
        });
        openRafRef.current = null;
      });
      return;
    }

    setIsPanelVisible(false);
    closeTimerRef.current = window.setTimeout(() => {
      setShouldRenderPanel(false);
      closeTimerRef.current = null;
    }, 300);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (openRafRef.current) {
        window.cancelAnimationFrame(openRafRef.current);
      }
      if (openRaf2Ref.current) {
        window.cancelAnimationFrame(openRaf2Ref.current);
      }
    };
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const now = Date.now();
    const lastSent = lastSentRef.current;
    if (lastSent && lastSent.text === text && now - lastSent.at < 450) return;
    lastSentRef.current = { text, at: now };

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const botMessage: ChatMessage = {
      id: Date.now() + 1,
      role: "bot",
      text: "오류가 발생했습니다.",
    };

    window.setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 350);
  };

  return (
    <div
      className="fixed bottom-[calc(var(--bottom-tabbar-height)+12px)] left-3 right-3 z-[1200] flex flex-col items-stretch gap-2.5 md:bottom-[calc(var(--bottom-tabbar-height)+20px)] md:left-auto md:right-5 md:items-end"
      aria-live="polite"
    >
      {shouldRenderPanel && (
        <section
          className={`flex h-[min(62vh,480px)] w-full origin-bottom-right flex-col overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-strong transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[min(520px,calc(100vh-120px))] md:w-[min(360px,calc(100vw-24px))] ${
            isPanelVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-6 scale-95 opacity-0"
          }`}
          role="dialog"
          aria-label="챗봇"
          aria-hidden={!isOpen}
        >
          <header className="flex h-16 items-center justify-between pl-3 pr-3.5 border-b border-gray-100">
            <div className="inline-flex items-center gap-2.5">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-600"
                aria-hidden="true"
              >
                <Icon name="leaf" size={16} color="white" />
              </span>
              <div>
                <h3 className="font-caption-03 text-gray-900">스마트팜 도우미</h3>
                <p className="mt-0.5 text-[11px] leading-none text-gray-400">빠르게 질문해보세요</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
              aria-label="채팅 닫기"
            >
              <Icon name="close" size={20} color="currentColor" />
            </button>
          </header>

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-white p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[82%] whitespace-pre-wrap rounded-xl px-3 py-2.5 font-caption-02 ${
                  message.role === "user"
                    ? "self-end rounded-br-md bg-green-600 text-white"
                    : "self-start rounded-bl-md bg-[#eef7e9] text-gray-800"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <footer className="flex gap-2 bg-white p-2.5 border-t border-gray-100">
            <Input
              className="h-10 min-w-0 flex-1 border-none bg-gray-50 px-3"
              height={42}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if ((e.nativeEvent as KeyboardEvent).isComposing || e.repeat) return;
                e.preventDefault();
                handleSend();
              }}
              placeholder="메시지를 입력하세요"
            />
            <Button
              variant="check"
              width={54}
              height={42}
              className="rounded-[var(--radius-s)] font-caption-03"
              onClick={handleSend}
              disabled={!canSend}
            >
              전송
            </Button>
          </footer>
        </section>
      )}

      <Button
        variant="check"
        width={56}
        height={56}
        className="self-end !rounded-full !p-0 !shadow-[0_10px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "채팅 닫기" : "채팅 열기"}
      >
        {isOpen ? (
          <Icon name="close" size={24} color="currentColor" />
        ) : (
          <span className="font-body-03">AI</span>
        )}
      </Button>
    </div>
  );
}
