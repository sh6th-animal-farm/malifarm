import React from 'react';

// 스타일 타입 정의
type ButtonVariant =
  | 'default' // 검정 / 초록 (hover)
  | 'default-warning' // 검정 / 노랑 (hover)
  | 'default-info' // 검정 / 파랑 (hover)
  | 'disabled' // 회색 (disabled)
  | 'outline-default' // 초록 테두리
  | 'outline-disabled' // 회색 테두리
  | 'check' // 초록 / 진한 초록 (hover)
  | 'subscriptionCheck' // 초록 / 진한 초록 - 청약 체크 전용
  | 'subscriptionCancel' // 흰색 배경 / 빨간 테두리 - 청약 취소 전용
  | 'subscriptionDisabled' // 회색 배경 / 호버 없음 - 청약 종료
  | 'subscriptionEnd' // 연한 회색 배경 / 회색 테두리 - 프로젝트 종료 전용
  | 'sub_modalFirst' // 회색 (nohover) - 모달 내 버튼
  | 'sub_modalSecond' // 초록 테두리 / 흰색 배경 (nohover) - 모달 내 버튼
  | 'sub_modalCheck' // 초록 테두리, 흰색 배경 / 초록 (hover)
  | 'buy' // 빨강 - 매수 버튼
  | 'sell'; // 파랑 - 매도 버튼

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  width?: number | string; // 가로 크기 (예: 200 또는 "100%")
  height?: number | string; // 세로 크기 (예: 48 또는 "3rem")
  children: React.ReactNode; // 버튼 내부 텍스트
}

export default function Button({
  variant = 'default',
  width = 400,
  height = 56,
  children = '버튼',
  className = '',
  ...props
}: ButtonProps) {
  // 공통 스타일
  const baseStyles =
    'inline-flex items-center justify-center font-button-01 transition-all duration-200 rounded-[var(--radius-s)] border overflow-hidden whitespace-nowrap cursor-pointer';

  // 버튼 타입별 스타일 매핑
  const variants: Record<ButtonVariant, string> = {
    default:
      'bg-gray-900 border-gray-900 text-white hover:bg-green-600 hover:border-green-600',
    'default-warning':
      'bg-gray-900 border-gray-900 text-white hover:bg-warning hover:border-warning',
    'default-info':
      'bg-gray-900 border-gray-900 text-white hover:bg-info hover:border-info',
    disabled:
      'bg-gray-500 border-gray-500 text-white cursor-not-allowed opacity-70',
    'outline-default': 'border-green-600 text-green-600 hover:bg-green-0',
    'outline-disabled':
      'bg-white border-gray-300 text-gray-300 cursor-not-allowed',
    check:
      'bg-green-600 border-green-600 text-white hover:bg-green-800 hover:border-green-700',
    subscriptionCheck:
      'bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/10',
    subscriptionCancel: 'bg-white border-red-500 text-red-500',
    subscriptionDisabled:
      'bg-gray-400 border-gray-400 text-white cursor-not-allowed',
    subscriptionEnd:
      'bg-gray-100 border-gray-100 text-gray-600 cursor-not-allowed',
    sub_modalFirst: 'bg-gray-900 border-gray-900 text-white font-button-02',
    sub_modalSecond: 'bg-white border-green-600 text-green-600 font-button-02',
    sub_modalCheck:
      'bg-white border-green-600 text-green-600 font-button-02 hover:bg-green-600 hover:border-green-600 hover:text-white',
    buy: 'bg-error border-error text-white font-button-02',
    sell: 'bg-info border-info text-white font-button-02',
  };

  // 인라인 스타일로 가로/세로 크기 결정
  const customStyle: React.CSSProperties = {
    width: width ?? 'auto',
    height: height ?? 'auto',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={customStyle}
      disabled={variant.includes('disabled')}
      {...props}
    >
      {children}
    </button>
  );
}
