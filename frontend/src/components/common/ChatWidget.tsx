import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/icon";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import chatbotIcon from "@/assets/icons/chatbot.png";

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
  const [isBotTyping, setIsBotTyping] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const openRafRef = useRef<number | null>(null);
  const openRaf2Ref = useRef<number | null>(null);
  const botReplyTimerRef = useRef<number | null>(null);
  const lastSentRef = useRef<{ text: string; at: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
      if (botReplyTimerRef.current) {
        window.clearTimeout(botReplyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldRenderPanel) return;
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isBotTyping, shouldRenderPanel, isPanelVisible]);

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
    setIsBotTyping(true);

    const botMessage: ChatMessage = {
      id: Date.now() + 1,
      role: "bot",
      text: "오류가 발생했습니다.",
    };

    botReplyTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
      setIsBotTyping(false);
      botReplyTimerRef.current = null;
    }, 350);
  };

  return (
    <div
      className="fixed bottom-[calc(var(--bottom-tabbar-height)+12px)] left-4 right-4 z-[1200] flex flex-col items-stretch gap-2.5 md:bottom-8 md:left-auto md:right-8 md:items-end xl:bottom-16 xl:right-18"
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
              <img src={chatbotIcon} alt="" className="h-12 w-12 object-contain" aria-hidden="true" />
              <div>
                <h3 className="font-caption-03 text-gray-900">도우미 양양</h3>
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

            {isBotTyping && (
              <div className="self-start rounded-bl-md rounded-xl bg-[#eef7e9] px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <footer className="flex gap-2 bg-white p-2.5 border-t border-gray-100">
            <Input
              className="min-w-0 flex-1 border-none bg-gray-50 px-3"
              height={40}
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
              variant={canSend ? "check" : "disabled"}
              width={54}
              height={38}
              className="rounded-[var(--radius-s)] font-caption-03"
              onClick={handleSend}
              disabled={!canSend}
            >
              전송
            </Button>
          </footer>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          className="self-end cursor-pointer border-none bg-transparent p-0 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
          onClick={() => setIsOpen(true)}
          aria-label="채팅 열기"
        >
          <img src={chatbotIcon} alt="" className="h-14 w-14 object-contain md:h-16 md:w-16" />
        </button>
      )}
    </div>
  );
}