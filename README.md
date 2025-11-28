# 호텔 예약 시스템

한 호텔을 이용하는 고객들이 객실을 쉽게 확인하고 예약을 진행할 수 있도록 구성된 웹 애플리케이션입니다.

## 주요 기능

### 고객 기능
- 회원가입 및 로그인
- 객실 목록 조회 및 검색
- 객실 상세 정보 확인
- 날짜별 예약 가능 여부 확인
- 예약 및 결제
- 예약 내역 조회 및 취소
- 공지사항/이벤트 확인
- 리뷰 작성
- 프로필 관리

### 관리자 기능
- 관리자 대시보드 (체크인/체크아웃 현황)
- 객실 관리 (추가/수정/삭제)
- 예약 관리
- 리뷰 관리
- 공지사항/이벤트 관리

## 기술 스택
- Java 17
- Spring Boot 4.0.0
- Spring Security
- Spring Data JPA
- MySQL
- Thymeleaf
- Lombok

## 데이터베이스 설정

### 1. MySQL 데이터베이스 생성

```sql
CREATE DATABASE hotelDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. DBeaver 연결 설정

1. DBeaver 실행
2. 새 데이터베이스 연결 생성
3. MySQL 선택
4. 연결 정보 입력:
   - Host: localhost
   - Port: 3306
   - Database: hotelDB
   - Username: sxxm
   - Password: sxxmpass
5. 연결 테스트 및 저장

### 3. 스키마 및 초기 데이터 생성

`schema.sql` 파일을 실행하여 테이블과 초기 데이터를 생성합니다.

**기본 관리자 계정:**
- 사용자명: admin
- 비밀번호: admin123

## 애플리케이션 실행

### 1. 의존성 설치 및 빌드

```bash
cd booking
./gradlew build
```

### 2. 애플리케이션 실행

```bash
./gradlew bootRun
```

또는 IDE에서 `BookingApplication.java`를 실행합니다.

### 3. 웹 브라우저 접속

http://localhost:8080

## 프로젝트 구조

```
booking/
├── src/main/java/com/hotel/booking/
│   ├── entity/          # 엔티티 클래스
│   ├── repository/      # Repository 인터페이스
│   ├── service/         # Service 클래스
│   ├── controller/      # Controller 클래스
│   └── security/        # Security 설정
├── src/main/resources/
│   ├── templates/       # Thymeleaf 템플릿
│   ├── static/          # 정적 리소스 (CSS, JS)
│   └── application.properties
└── schema.sql           # 데이터베이스 스키마
```

## 주요 엔티티

- **User**: 사용자 정보 (고객/관리자)
- **Room**: 객실 정보
- **Booking**: 예약 정보
- **Payment**: 결제 정보
- **Review**: 리뷰 정보
- **Notice**: 공지사항/이벤트 정보

## 사용 방법

### 고객으로 사용하기
1. 회원가입 또는 기본 계정으로 로그인
2. 객실 목록에서 원하는 객실 선택
3. 날짜 및 인원 선택 후 예약
4. 결제 진행
5. 예약 내역에서 확인

### 관리자로 사용하기
1. 관리자 계정으로 로그인 (admin / admin123)
2. 관리자 대시보드에서 현재 현황 확인
3. 각 관리 메뉴에서 객실, 예약, 리뷰, 공지사항 관리

## 주의사항

- 데이터베이스 연결 정보는 `application.properties`에서 확인 및 수정 가능
- 관리자 비밀번호는 BCrypt로 암호화되어 저장됨 (schema.sql 참조)
- 이미지 URL은 외부 링크 또는 `/static/images/` 경로에 저장된 파일 사용 가능

