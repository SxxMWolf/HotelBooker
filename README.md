# 🏨 HotelBooker - 호텔 예약 시스템

전문적인 호텔 예약 관리 시스템입니다. 사용자 예약, 관리자 대시보드, 결제 처리, 리뷰 관리 등 호텔 운영에 필요한 모든 기능을 제공합니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [환경 설정](#환경-설정)
- [API 문서](#api-문서)
- [데이터베이스 구조](#데이터베이스-구조)
- [주요 기능 상세](#주요-기능-상세)
- [개발 가이드](#개발-가이드)
- [배포](#배포)

---

## ✨ 주요 기능

### 사용자 기능
- 🔐 **회원가입 및 로그인**: JWT 기반 인증 시스템
- 🔍 **아이디/비밀번호 찾기**: 이메일 인증을 통한 계정 복구
- 🏠 **객실 조회**: 객실 목록, 상세 정보, 이미지 확인
- 📅 **예약 관리**: 객실 예약, 예약 조회, 예약 취소
- 💳 **결제 처리**: 카드, 계좌이체, 현금 결제 지원
- ⭐ **리뷰 작성**: 객실 리뷰 및 평점 작성
- 📝 **마이페이지**: 예약 내역, 리뷰 관리
- 📢 **공지사항**: 호텔 공지사항 및 이벤트 확인

### 관리자 기능
- 📊 **대시보드**: 실시간 통계 및 현황 모니터링
  - 예약 현황 (예약, 체크인, 체크아웃)
  - 객실 상태 관리 (청소 완료, 청소 필요, 보수 중)
  - 월별 통계 및 매출 분석
- 🏨 **객실 관리**: 객실 CRUD, 상태 관리, 활성화/비활성화
- 📋 **예약 관리**: 예약 조회, 상태 변경 (체크인/체크아웃)
- 💬 **리뷰 관리**: 리뷰 공개/비공개, 관리자 답변 작성
- 📢 **공지사항 관리**: 공지사항 작성, 수정, 삭제
- 📈 **통계 분석**: 기간별 매출, 예약 통계 분석

---

## 🛠 기술 스택

### 백엔드 (bookBE)
- **프레임워크**: Spring Boot 3.3.4
- **언어**: Java 17
- **데이터베이스**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **보안**: Spring Security + JWT
- **빌드 도구**: Gradle
- **API 문서**: SpringDoc OpenAPI (Swagger)
- **이메일**: Spring Mail (Gmail SMTP)

### 프론트엔드 (bookFE)
- **프레임워크**: React 19
- **빌드 도구**: Vite 7
- **라우팅**: React Router DOM 7
- **스타일링**: Tailwind CSS 3
- **HTTP 클라이언트**: Axios
- **상태 관리**: React Context API

---

## 📁 프로젝트 구조

```
HotelBooker/
├── bookBE/                    # 백엔드 (Spring Boot)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/hotel/booking/
│   │       │   ├── admin/     # 관리자 기능
│   │       │   ├── auth/      # 인증 (로그인, 회원가입, 계정 복구)
│   │       │   ├── booking/   # 예약 관리
│   │       │   ├── common/    # 공통 (보안, 예외 처리)
│   │       │   ├── notice/    # 공지사항
│   │       │   ├── payment/   # 결제
│   │       │   ├── review/   # 리뷰
│   │       │   ├── room/     # 객실
│   │       │   └── user/     # 사용자
│   │       └── resources/
│   │           └── application.yml
│   └── build.gradle
│
├── bookFE/                    # 프론트엔드 (React)
│   ├── src/
│   │   ├── components/        # 공통 컴포넌트
│   │   ├── context/          # Context API (인증 상태)
│   │   ├── pages/            # 페이지 컴포넌트
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── MyPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ...
│   │   └── services/          # API 서비스
│   └── package.json
│
└── HOTEL_BOOKING_SYSTEM_DOCUMENTATION.md  # 상세 기술 문서
```

---

## 🚀 시작하기

### 사전 요구사항

- **Java**: JDK 17 이상
- **Node.js**: 18 이상
- **PostgreSQL**: 12 이상
- **Gradle**: 7.x (프로젝트에 포함된 Wrapper 사용 가능)

### 1. 저장소 클론

```bash
git clone <repository-url>
cd HotelBooker
```

### 2. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 설정합니다:

```sql
CREATE DATABASE hoteldb;
```

### 3. 백엔드 설정 및 실행

```bash
cd bookBE

# application.yml 파일 수정 (데이터베이스 연결 정보)
# src/main/resources/application.yml

# 애플리케이션 실행
./gradlew bootRun

# 또는 빌드 후 실행
./gradlew build
java -jar build/libs/booking-0.0.1-SNAPSHOT.jar
```

백엔드 서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 4. 프론트엔드 설정 및 실행

```bash
cd bookFE

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

프론트엔드 개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

---

## ⚙️ 환경 설정

### 백엔드 설정 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hoteldb
    username: your_username
    password: your_password
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}  # 환경 변수로 설정
    password: ${MAIL_PASSWORD}  # 환경 변수로 설정

jwt:
  secret: your-secret-key-here
  expiration: 2592000000  # 30일
```

### 환경 변수 설정

이메일 인증 기능을 사용하려면 환경 변수를 설정하세요:

```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

### 프론트엔드 API 설정

프론트엔드에서 백엔드 API 주소를 설정합니다:

```javascript
// bookFE/src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 📚 API 문서

### Swagger UI

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui.html
```

### 주요 API 엔드포인트

#### 인증 (Auth)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/recover-id` - 아이디 찾기
- `POST /api/auth/recover-password` - 비밀번호 찾기
- `POST /api/auth/verify-email` - 이메일 인증

#### 객실 (Room)
- `GET /api/rooms` - 객실 목록 조회
- `GET /api/rooms/{id}` - 객실 상세 조회

#### 예약 (Booking)
- `POST /api/bookings` - 예약 생성
- `GET /api/bookings/my` - 내 예약 목록
- `DELETE /api/bookings/{id}` - 예약 취소

#### 결제 (Payment)
- `POST /api/payments` - 결제 처리
- `GET /api/payments/{id}` - 결제 정보 조회

#### 리뷰 (Review)
- `POST /api/reviews` - 리뷰 작성
- `GET /api/reviews/room/{roomId}` - 객실별 리뷰 조회
- `GET /api/reviews/my` - 내 리뷰 목록

#### 관리자 (Admin)
- `GET /api/admin/dashboard` - 대시보드 데이터
- `GET /api/admin/rooms/status-summary` - 객실 상태 요약
- `GET /api/admin/bookings/today-checkins` - 오늘 체크인 목록
- `GET /api/admin/bookings/today-checkouts` - 오늘 체크아웃 목록
- `GET /api/admin/bookings/current-stays` - 현재 투숙 중 목록
- `GET /api/admin/statistics` - 통계 분석

자세한 API 문서는 `HOTEL_BOOKING_SYSTEM_DOCUMENTATION.md`를 참고하세요.

---

## 🗄 데이터베이스 구조

### 주요 엔티티

#### Users (사용자)
- 사용자 정보, 역할 (USER, ADMIN)

#### Rooms (객실)
- 객실 정보, 가격, 상태 (CLEAN, DIRTY, MAINTENANCE)
- `available`: 객실 활성화/비활성화 플래그
- `status`: 청소/보수 상태

#### Bookings (예약)
- 예약 정보, 체크인/체크아웃 날짜
- 상태: CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED

#### Payments (결제)
- 결제 정보, 결제 방법, 결제 상태

#### Reviews (리뷰)
- 리뷰 및 평점, 관리자 답변

#### Notices (공지사항)
- 공지사항, 이벤트, 프로모션

### 데이터베이스 관계

- User → Bookings (1:N)
- User → Reviews (1:N)
- Room → Bookings (1:N)
- Room → Reviews (1:N)
- Booking → Payment (1:1)

**⚠️ 중요**: 모든 CASCADE 설정이 제거되어 있어, 데이터 무결성을 보장합니다. 결제 내역과 예약 내역은 법적 증빙 자료로 보존됩니다.

자세한 데이터베이스 구조는 `HOTEL_BOOKING_SYSTEM_DOCUMENTATION.md`를 참고하세요.

---

## 🎯 주요 기능 상세

### 예약 중복 방지 (Overbooking Prevention)

시스템은 같은 객실의 같은 날짜에 중복 예약을 방지합니다.

- **애플리케이션 레벨 체크**: 예약 생성 시 날짜 범위 겹침 확인
- **취소된 예약 제외**: `CANCELLED` 상태의 예약은 중복 체크에서 제외
- **날짜 범위 겹침 조건**: `(checkInDate_A < checkOutDate_B) AND (checkOutDate_B > checkInDate_A)`

### 객실 상태 관리

객실은 두 가지 독립적인 속성으로 관리됩니다:

1. **`available`** (Boolean): 객실 활성화/비활성화
   - `true`: 예약 가능
   - `false`: 비활성화 (리모델링, 장기 보수 등)

2. **`status`** (RoomStatus): 청소/보수 상태
   - `CLEAN`: 청소 완료
   - `DIRTY`: 청소 필요 (체크아웃 시 자동 변경)
   - `MAINTENANCE`: 보수 중

**자동화**:
- 체크아웃 처리 시 자동으로 `DIRTY` 상태로 변경
- 청소 완료는 관리자가 수동으로 처리

### 관리자 대시보드 통계

대시보드는 예약 기준과 객실 기준으로 독립적으로 계산됩니다:

**예약 기준 항목**:
- 예약 (booked): `CONFIRMED` 상태 + 미래/오늘 체크인
- 오늘 체크인: `CONFIRMED` + 오늘 체크인 날짜
- 현재 투숙 중: `CHECKED_IN` 상태
- 오늘 체크아웃: `CHECKED_IN` + 오늘 체크아웃 날짜

**객실 기준 항목**:
- 청소 완료 객실: `status = CLEAN`
- 청소 필요: `status = DIRTY`
- 보수 중: `status = MAINTENANCE`

### 이메일 인증

회원가입 및 계정 복구 시 이메일 인증을 사용합니다:
- 인증 코드 생성 및 전송
- 인증 코드 만료 시간 관리
- Gmail SMTP를 통한 이메일 전송

---

## 💻 개발 가이드

### 백엔드 개발

#### 패키지 구조
```
com.hotel.booking/
├── admin/          # 관리자 기능
├── auth/           # 인증
├── booking/        # 예약
├── common/         # 공통 (보안, 예외)
├── notice/         # 공지사항
├── payment/        # 결제
├── review/         # 리뷰
├── room/           # 객실
└── user/           # 사용자
```

각 패키지는 다음 구조를 따릅니다:
- `controller/`: REST API 엔드포인트
- `service/`: 비즈니스 로직
- `repository/`: 데이터 접근
- `entity/`: JPA 엔티티
- `dto/`: 데이터 전송 객체

#### 빌드 및 테스트

```bash
# 빌드
./gradlew build

# 테스트 실행
./gradlew test

# 애플리케이션 실행
./gradlew bootRun
```

### 프론트엔드 개발

#### 컴포넌트 구조
- `pages/`: 페이지 컴포넌트
- `components/`: 재사용 가능한 컴포넌트
- `context/`: Context API (인증 상태)
- `services/`: API 호출 서비스

#### 개발 서버

```bash
# 개발 서버 실행 (Hot Reload)
npm run dev

# 린트 검사
npm run lint

# 프로덕션 빌드
npm run build
```

### 코드 스타일

- **백엔드**: Java 컨벤션 준수, Lombok 사용
- **프론트엔드**: ESLint 규칙 준수, 함수형 컴포넌트 사용

---

## 🚢 배포

### 백엔드 배포

1. **JAR 파일 빌드**:
```bash
cd bookBE
./gradlew build
```

2. **JAR 파일 실행**:
```bash
java -jar build/libs/booking-0.0.1-SNAPSHOT.jar
```

3. **환경 변수 설정**:
```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
export SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/hoteldb
export SPRING_DATASOURCE_USERNAME=your-db-username
export SPRING_DATASOURCE_PASSWORD=your-db-password
```

### 프론트엔드 배포

1. **프로덕션 빌드**:
```bash
cd bookFE
npm run build
```

2. **빌드 결과물**: `bookFE/dist/` 폴더에 생성됩니다.

3. **정적 파일 서버에 배포**: Nginx, Apache 등에 `dist/` 폴더 내용을 배포합니다.

### Docker 배포 (선택사항)

Docker를 사용한 배포도 가능합니다. Dockerfile을 추가하여 컨테이너화할 수 있습니다.

---

## 📖 추가 문서

- **상세 기술 문서**: `HOTEL_BOOKING_SYSTEM_DOCUMENTATION.md`
  - 관리자 대시보드 계산 방법
  - 객실과 예약 상태 구현
  - 데이터베이스 구조 상세
  - API 엔드포인트 전체 목록
  - 통계 계산 방법
  - 예약 중복 방지 로직

---

## 🔒 보안

- **JWT 인증**: 토큰 기반 인증 시스템
- **Spring Security**: 보안 필터 및 권한 관리
- **비밀번호 암호화**: BCrypt 암호화
- **SQL Injection 방지**: JPA 사용으로 자동 방지
- **CORS 설정**: 프론트엔드 도메인 허용

---

## 🐛 문제 해결

### 일반적인 문제

1. **데이터베이스 연결 오류**
   - PostgreSQL이 실행 중인지 확인
   - `application.yml`의 데이터베이스 설정 확인

2. **이메일 전송 실패**
   - Gmail 앱 비밀번호 사용 필요
   - 환경 변수 `MAIL_USERNAME`, `MAIL_PASSWORD` 설정 확인

3. **CORS 오류**
   - 백엔드 CORS 설정 확인
   - 프론트엔드 API 주소 확인

---

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

## 👥 기여

이슈 및 풀 리퀘스트를 환영합니다!

---

## 📧 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**마지막 업데이트**: 2025년 1월

