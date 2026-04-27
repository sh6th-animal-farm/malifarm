## 마이리틀 스마트팜
<img width="1437" height="806" alt="image" src="https://github.com/user-attachments/assets/1770d5c8-b4e3-409c-8187-0dcb0831bf76" />

## 프로젝트 소개
- 개요 : 유휴 농지를 스마트팜으로 전환하고, 해당 스마트팜에서 발생하는 수익권을 토큰 증권 형태로 발행·관리하는 플랫폼
- 목적 : 농업과 조각 투자를 결합하여 농업 투자에 대한 개인 투자자의 진입 장벽을 제거하고, 지역 경제 활성화 및 탄소 중립 실천
- 기간 : 2026.01~02, 2026.03~04 (총 2개월)

## 링크
- 배포 URL : https://www.malifarm.site
- 시연 영상 : https://www.youtube.com/watch?v=yCeqjWOhzlw

## 주요 기능
### (1) 프로젝트 생애주기 관리 (Project Life Cycle)
- 프로젝트 등록: 새로운 스마트팜 투자를 위한 기초 자산 정보 및 수익권 토큰 발행 규모 설정
- 자동 상태 제어: Spring Batch와 Scheduler를 연동하여 [청약 대기 → 시작 → 마감 → 토큰 분배 → 배당 → 종료]로 이어지는 생애주기 자동화
- 수익 요약 및 정산: 프로젝트 종료 시 최종 수익을 요약하고 인당 배당액을 산출하는 다단계(Step) 정산 프로세스

### (2) 프로젝트 청약
- GIS 기반 대시보드: 카카오맵 API를 활용하여 전국 스마트팜 위치 시각화 및 지역별 수익률 클러스터링 제공
- 청약 신청 및 관리: 실시간 계좌 연동을 통한 투자금 예치 및 청약 신청, 취소 프로세스 구현
- 무결성 원장 기록: 모든 청약 내역을 이중 장부 형태로 기록하여 데이터 변조 방지 및 정합성 확보

### (3) 토큰 거래
- 토큰 거래소(Exchange): 발행된 수익권 토큰의 매수·매도·주문 취소 및 실시간 체결 엔진 구축
- 실시간 시세 데이터: Redis Pub/Sub을 활용한 웹소켓 통신을 통해 호가창, 체결 내역, 차트 데이터를 실시간으로 반영
- 디지털 자산 지갑: 시세 변화 및 주문/체결 현황에 따른 자산 현황을 마이페이지에서 실시간으로 확인 및 관리

### (4) 뉴스 생성
- 3H vs 3H 데이터 분석: 6시간마다 스케줄러가 작동하여 시장의 전반전(이전 3시간)과 후반전(최근 3시간) 데이터를 비교 분석
- 정밀한 특징주 필터링: 거래량 급증이나 호가 불균형 등 수급 데이터가 임계치를 넘긴 종목을 핫 토큰으로 선별
- 시나리오 기반 AI 시황 생성: 분석된 데이터와 스마트팜 도메인 특화 시나리오를 AI가 결합하여 보다 전문적인 뉴스를 발행

### (5) 탄소배출권 구매
- 탄소 마켓 플레이스: 스마트팜을 운영하며 발생한 탄소 크레딧을 기업 회원이 구매할 수 있는 전용 마켓 운영
- 결제 솔루션 연동: 포트원(KG 이니시스) API를 통한 실제 탄소배출권 결제 프로세스 구현
- 구매 이력 증빙: 탄소배출권 구매 내역 및 인증 현황을 마이페이지를 통해 관리

## 팀원 소개 및 역할

<table>
  <tbody>
    <tr>
      <td width="20%" align="center"><a href="https://github.com/lsj1137"><b>황유나(팀장)</b></a></td>
      <td width="20%" align="center"><a href="https://github.com/minsjes"><b>강민제</b></a></td>
      <td width="20%" align="center"><a href="https://github.com/songseonghyeon"><b>송성현</b></a></td>
      <td width="16.6%" align="center"><a href="https://github.com/Yanghaji"><b>양지은</b></a></td>
      <td width="20%" align="center"><a href="https://github.com/dydwns6837"><b>유용준</b></a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/hyn4008"><img src="https://avatars.githubusercontent.com/u/82206168?v=4" width="180px;" alt=""/></a></td>
      <td align="center"><a href="https://github.com/minsjes"><img src="https://avatars.githubusercontent.com/u/89784091?s=96&v=4" width="180px;" alt=""/></a></td>
      <td align="center"><a href="https://github.com/songseonghyeon"><img src="https://avatars.githubusercontent.com/u/96803282?s=96&v=4" width="180px;" alt=""/></a></td>
      <td align="center"><a href="https://github.com/Yanghaji"><img src="https://avatars.githubusercontent.com/u/170301117?v=4" width="180px;" alt=""/></a></td>
      <td align="center"><a href="https://github.com/dydwns6837"><img src="https://avatars.githubusercontent.com/u/144577722?v=4" width="180px;" alt=""/></a></td>
    </tr>
    <tr>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>레이아웃, 헤더, 푸터</li>
            <li>토큰거래소 목록, 상세 페이지</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>실시간 체결 엔진 구축</li>
            <li>주문 및 주문 취소 기능</li>
            <li>호가, 체결, 차트 실시간 반영</li>
            <li>전자지갑 실시간 반영</li>
            <li>- 기타 외부거래소 API</li>
          </ul>
          <li><b>CI/CD</b> (GitHub Actions)</li>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>거래소 목록 페이지</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>주문 / 체결</li>
            <li>차트 / 시세</li>
            <li>Redis 실시간 통신</li>
            <li>기타 API</li>
          </ul>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>프로젝트 상세 페이지</li>
            <li>계좌 체크 실패 모달</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>프로젝트 상세 조회</li>
            <li>계좌 연동 체크</li>
            <li>청약 신청</li>
            <li>토큰 분배 로직</li>
            <li>진행 스케줄러</li>
          </ul>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>로그인 페이지</li>
            <li>탄소마켓 전체 / 상세</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>로그인 후 토큰 관리</li>
            <li>탄소마켓 전체 / 상세</li>
            <li>지갑, 거래내역 조회</li>
          </ul>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>회원가입 페이지</li>
            <li>탄소마켓 전체 / 모달</li>
            <li>이니시스 결제 연동</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>회원가입</li>
            <li>탄소마켓 전체 조회</li>
            <li>사업자/메일 인증</li>
            <li>내 정보/내역 조회</li>
          </ul>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## 서비스 아키텍처
<img width="1420" height="1060" alt="image" src="https://github.com/user-attachments/assets/9964de5a-34e9-4d8b-b691-8b475e508e14" />

## 기술 스택
### 공통
- GitHub, Swagger, Notion, Slack, Discord
### 프론트엔드
- React, Vite, TailwindCSS, PWA, KakaoMaps
### 백엔드
- Java, Spring Boot, Spring Batch, Spring Security, Python, FastAPI, MyBatis, PostgreSQL, Redis
### CI/CD
- GitHub Actions, Docker
