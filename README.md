## 마이리틀 스마트팜
<img width="1437" height="806" alt="image" src="https://github.com/user-attachments/assets/1770d5c8-b4e3-409c-8187-0dcb0831bf76" />


## 프로젝트 소개
- 개요 : 유휴 농지를 스마트팜으로 전환하고, 해당 스마트팜에서 발생하는 수익권을 토큰 증권 형태로 발행·관리하는 플랫폼
- 목적 : 농업과 조각 투자를 결합하여 농업 투자에 대한 개인 투자자의 진입 장벽을 제거하고, 지역 경제 활성화 및 탄소 중립 실천
- 기간 : 2026.01 ~ 02, 2026.03 ~ 04 (총 2개월)


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
      <td width="20%" align="center"><a href="https://github.com/hyn4008"><b>황유나(팀장)</b></a></td>
      <td width="20%" align="center"><a href="https://github.com/minsjes"><b>강민제</b></a></td>
      <td width="20%" align="center"><a href="https://github.com/songseonghyeon"><b>송성현</b></a></td>
      <td width="20%" align="center"><a href="https://github.com/Yanghaji"><b>양지은</b></a></td>
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
            <li>토큰거래소 페이지</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>실시간 체결 엔진 구축</li>
            <li>주문 및 주문 취소 기능</li>
            <li>호가, 체결, 차트 실시간 반영</li>
            <li>전자지갑 실시간 반영</li>
            <li>외부증권사 Open API</li>
          </ul>
          <li><b>CI/CD</b> (GitHub Actions)</li>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>메인페이지</li>
            <li>마이페이지</li>
            <li>뉴스페이지</li>
            <li>반응형/PWA</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>실시간 매칭 엔진 구축</li>
            <li>데이터 스토리지 최적화</li>
            <li>메시징 채널(Pub/Sub) 설계</li>
            <li>실시간 시세 스트리밍</li>
            <li>외부증권사 Open API</li>
            <li>AI 유동성 공급 에이전트</li>
          </ul>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>프로젝트 페이지</li>
            <li>관리자 페이지</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>프로젝트 생애주기 관리</li>
            <li>관심 프로젝트 처리</li>
            <li>청약 신청/취소</li>
            <li>토큰 분배</li>
            <li>실시간 농장 정보 API</li>
            <li>토큰 원장 해시함수</li>
          </ul>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>탄소마켓 페이지</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>로그인 세션 관리</li>
            <li>JWT와 Security 관리</li>
            <li>탄소마켓 지분 계산</li>
            <li>LLM을 활용한 뉴스 발행</li>
            <li>마켓메이커를 통한 시장 활성화</li>
          </ul>
        </ul>
      </td>
      <td align="start" valign="top">
        <ul>
          <li>기획 / 디자인</li>
          <li><b>프론트엔드</b></li>
          <ul>
            <li>로그인/회원가입 페이지</li>
          </ul>
          <li><b>백엔드</b></li>
          <ul>
            <li>로그인 세션 관리</li>
            <li>회원가입 이메일 인증</li>
            <li>비밀번호 검증 로직</li>
            <li>Security를 통한 역할 접근 제어</li>
            <li>탄소마켓 스냅샷 로직 적용</li>
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
![GitHub](https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white)
![Swagger](https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Notion](https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)
![Discord](https://img.shields.io/badge/discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)

### 프론트엔드
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-1a0dab?style=for-the-badge&logo=PWA&logoColor=white)
![KakaoTalk](https://img.shields.io/badge/kakaomaps-FFCD00?style=for-the-badge&logo=kakao&logoColor=black)

### 백엔드
![Java](https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![Spring Batch](https://img.shields.io/badge/Spring%20Batch-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571.svg?style=for-the-badge&logo=fastapi)
![MyBatis](https://img.shields.io/badge/MyBatis-C71A11?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### CI/CD
![GitHub Actions](https://img.shields.io/badge/github%20actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
