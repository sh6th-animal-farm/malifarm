# 1. 빌드 스테이지: 빌드된 jar 파일을 가져오기 위한 환경
FROM eclipse-temurin:17-jdk-focal

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 빌드된 jar 파일을 이미지 내부로 복사
COPY build/libs/*-SNAPSHOT.jar app.jar

# 4. 실행 포트 설정
EXPOSE 8080

# 5. 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]