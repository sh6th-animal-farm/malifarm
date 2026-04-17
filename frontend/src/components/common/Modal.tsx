import { CheckCircle, WarningCircle } from '../icon/Icons';
import Button from './Button';

interface ModalProps {
  variant: 'warning' | 'check'; // 빨간색 경고 vs 파란색 체크
  title: string;
  message?: string;
  text?: string;
  leftText?: string;
  rightText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function Modal({
  variant,
  title,
  message,
  text,
  leftText,
  rightText,
  onConfirm,
  onCancel,
}: ModalProps) {
  // 상태(variant)에 따른 스타일 및 아이콘 분기 처리
  const isWarning = variant === 'warning';

  return (
    <div className="flex flex-col gap-6 items-center justify-center bg-white rounded-[var(--radius-m)] w-[360px] pt-9 pb-6 px-6 shadow-std">
      {isWarning ? <WarningCircle /> : <CheckCircle />}

      <div className="flex flex-col gap-4 text-center">
        <h2 className="font-subtitle-01 text-gray-900">{title}</h2>
        {message && <p className="font-caption-01 text-gray-900">{message}</p>}
      </div>

      {text ? (
        <Button
          variant="check"
          width="312px"
          height="46px"
          children={text}
          onClick={onConfirm}
        />
      ) : (
        <div className="flex gap-3">
          <Button
            variant="check"
            width="150px"
            height="46px"
            children={leftText}
            onClick={onConfirm}
          />
          <Button
            variant="outline-default"
            width="150px"
            height="46px"
            children={rightText}
            onClick={onCancel}
          />
        </div>
      )}
    </div>
  );
}
