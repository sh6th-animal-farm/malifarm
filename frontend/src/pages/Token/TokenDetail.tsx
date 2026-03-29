import { useParams } from 'react-router-dom';
import TokenTradeCard from './components/TokenTradeCard';

export default function TokenDetail() {
  const { id } = useParams(); // URL 파라미터에서 토큰 ID 추출

  return (
    <>
      <div>토큰 {id}번 상세 페이지</div>
      <TokenTradeCard tokenId={Number(id)} />
    </>
  );
}
