interface PlaceholderProps {
  title?: string;
}

export default function Placeholder({ title = "페이지" }: PlaceholderProps) {
  return (
    <main className="bg-white min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6 py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#EFFFE7] flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.9666 6.16753C18.1291 6.01503 18.3652 5.96003 18.5836 6.03003C18.8324 6.11253 19 6.34253 19 6.60003V11.2725C19 14.5525 16.2553 17.2 12.9367 17.2C10.9816 17.2 9.2957 15.9625 8.68379 14.2325C7.78496 15.0025 7.21875 16.135 7.21875 17.4C7.21875 17.7325 6.94707 18 6.60938 18C6.27168 18 6 17.7325 6 17.4C6 15.5275 6.96992 13.8775 8.44004 12.9075C9.33633 12.3175 10.4053 12 11.4844 12H13.5156C13.8533 12 14.125 11.7325 14.125 11.4C14.125 11.0675 13.8533 10.8 13.5156 10.8H11.4844C10.4764 10.8 9.52168 11.02 8.66602 11.4125C9.25762 9.66252 10.9309 8.40003 12.9062 8.40003C14.5922 8.40003 15.8465 7.84753 16.6818 7.30003C17.1693 6.98003 17.5832 6.59753 17.9691 6.16753H17.9666Z"
              fill="#4A9F2E"
            />
          </svg>
        </div>
        <h2 className="text-[20px] font-semibold text-[#191919] mb-3">{title}</h2>
        <p className="text-[16px] text-[#767676] max-w-sm">
          이 페이지는 아직 준비 중입니다. 계속 프롬프트를 입력해서 페이지 내용을 채워보세요.
        </p>
      </div>
    </main>
  );
}
