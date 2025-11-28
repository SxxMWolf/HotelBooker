# Backend (bookingBE)

이 폴더는 호텔 예약 시스템의 Spring Boot 백엔드 프로젝트입니다.

## 구조

```
bookingBE/
├── src/
│   ├── main/
│   │   ├── java/com/hotel/booking/
│   │   │   ├── entity/        # 엔티티 클래스
│   │   │   ├── repository/    # Repository 인터페이스
│   │   │   ├── service/       # Service 클래스
│   │   │   ├── controller/    # Controller 클래스
│   │   │   └── security/      # Security 설정
│   │   └── resources/
│   │       └── application.properties
│   └── test/                  # 테스트 코드
├── build.gradle               # Gradle 빌드 설정
└── settings.gradle
```

## 실행 방법

```bash
cd bookingBE
./gradlew bootRun
```

또는 IDE에서 `BookingApplication.java`를 실행합니다.

## 설정

- **application.properties**: 데이터베이스 연결 및 기타 설정
- 템플릿 및 정적 리소스는 `../bookingFE/` 폴더를 참조합니다.

## 주요 패키지

- **entity**: 데이터베이스 엔티티 (User, Room, Booking 등)
- **repository**: 데이터 접근 계층
- **service**: 비즈니스 로직 계층
- **controller**: 웹 요청 처리 계층
- **security**: Spring Security 설정

