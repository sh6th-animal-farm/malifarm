import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import { CircularProgress } from '@/components/icon/Icons';

interface CreateAccProps {
  step: number;
  onClose: () => void;
}

export default function CreateAcc({ step, onClose }: CreateAccProps) {
  let msg = '';
  switch (step) {
    case 1:
      msg = '계좌 생성을 위한\n정보를 입력하고 있어요';
      break;
    case 2:
      msg = '강황증권에서\n계좌를 생성하고 있어요';
      break;
    case 3:
      msg = '강황증권의 계좌를\n마리팜의 계정과 연동하고 있어요';
      break;
    case 4:
      msg =
        '계좌 생성 및 연동이 완료되었어요.\n마리팜의 다양한 서비스를 이용해보세요';
      break;
    default:
      msg = '계좌를 생성하는 중입니다.';
  }

  return (
    <div className="flex flex-col gap-6 bg-white rounded-[var(--radius-m)] w-[368px] h-[380px] px-6 py-8 shadow-std">
      <ProgressBar percent={step * 25} />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="font-body-04 text-green-600">STEP {step}</p>
          <span className="font-body-03 text-gray-800 whitespace-pre-wrap">
            {msg}
          </span>
        </div>
        <CircularProgress percent={step * 25} />
        {step === 4 && (
          <Button
            variant="sub_modalCheck"
            width={320}
            height={46}
            children="확인"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
}
