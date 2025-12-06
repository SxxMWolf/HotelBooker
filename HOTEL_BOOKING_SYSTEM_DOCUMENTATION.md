# 호텔 예약 시스템 전체 문서

## 목차
1. [관리자 대시보드 계산 방법](#1-관리자-대시보드-계산-방법)
2. [객실과 예약 상태 구현](#2-객실과-예약-상태-구현)
3. [데이터베이스 구조](#3-데이터베이스-구조)
4. [API 엔드포인트](#4-api-엔드포인트)
5. [통계 계산 방법 상세](#5-통계-계산-방법-상세)
6. [객실 상태 자동화 시스템](#6-객실-상태-자동화-시스템)

---

## 1. 관리자 대시보드 계산 방법

### 1.1 예약 (booked)
**계산 방법**: `AdminService.calculateBookedCount()`
- **조건**: 
  - 예약 상태 = `CONFIRMED`
  - 체크인 날짜 >= 오늘
- **기준**: 예약(Reservation) 기준만 사용 - 객실 상태와 무관
- **코드 위치**: `AdminService.java:509-511`

### 1.2 청소 완료 객실 (available)
**계산 방법**: `AdminService.getDashboard()` 또는 `getRoomStatusSummary()`
- **조건**: 객실 상태 = `CLEAN` (청소 완료 상태)
- **기준**: 객실(Room) 기준만 사용 - 예약과 무관
- **⚠️ 중요**: 이는 "청소가 완료된 객실"의 개수입니다. **예약 가능 여부와는 무관**합니다.
  - `CLEAN` 상태라도 예약 중일 수 있습니다 (`Booking.status = CHECKED_IN`)
  - 실제 예약 가능 여부는 `Booking.status`를 확인해야 합니다.
- **코드 위치**: `AdminService.java:73-76`

### 1.3 청소 필요 (cleaningNeeded)
**계산 방법**: `AdminService.getDashboard()` 또는 `getRoomStatusSummary()`
- **조건**: 객실 상태 = `DIRTY`
- **기준**: 객실(Room) 기준만 사용 - 예약과 무관
- **코드 위치**: `AdminService.java:78-81`

### 1.4 보수 중 (maintenance)
**계산 방법**: `AdminService.getDashboard()` 또는 `getRoomStatusSummary()`
- **조건**: 객실 상태 = `MAINTENANCE`
- **기준**: 객실(Room) 기준만 사용 - 예약과 무관
- **코드 위치**: `AdminService.java:83-86`

### 1.5 오늘 체크인 (todayCheckIns)
**계산 방법**: `AdminService.getTodayCheckIns()`
- **조건**: 
  - 예약 상태 = `CONFIRMED`
  - 체크인 날짜 = 오늘
- **기준**: 예약(Reservation) 기준만 사용 - 객실 상태와 무관
- **코드 위치**: `AdminService.java:115-123`

### 1.6 현재 투숙 중 (currentStays)
**계산 방법**: `AdminService.getCurrentStays()`
- **조건**: 예약 상태 = `CHECKED_IN`
- **기준**: 예약(Reservation) 기준만 사용 - 객실 상태와 무관
- **코드 위치**: `AdminService.java:136-144`

### 1.7 오늘 체크아웃 (todayCheckOuts)
**계산 방법**: `AdminService.getTodayCheckOuts()`
- **조건**: 
  - 예약 상태 = `CHECKED_IN`
  - 체크아웃 날짜 = 오늘
- **기준**: 예약(Reservation) 기준만 사용 - 객실 상태와 무관
- **코드 위치**: `AdminService.java:125-134`

### 1.8 현재 사용 중인 객실 (inUse)
**계산 방법**: `AdminService.getDashboard()` 또는 `getRoomStatusSummary()`
- **조건**: 
  - 해당 객실에 `CHECKED_IN` 상태의 예약이 있음
  - 체크아웃 날짜 >= 오늘
- **기준**: 예약 기준 (객실과 예약을 함께 고려)
- **코드 위치**: `AdminService.java:88-94`

---

## 2. 객실과 예약 상태 구현

### 2.1 객실 속성: `available`과 `status`

**엔티티**: `Room.java`

#### `available` (Boolean): 객실 활성화 여부
- `true`: 객실이 활성화되어 예약 가능 (기본값)
- `false`: 객실이 비활성화되어 예약 불가
- **용도**: 관리자가 객실을 완전히 비활성화할 때 사용
  - 객실 폐쇄
  - 장기 리모델링
  - 장기 보수
- **제어**: `AdminService.disableRoom()`, `enableRoom()`
- **코드 위치**: `Room.java:41-43`, `AdminService.java:346-360`

#### `status` (RoomStatus): 청소/보수 상태
**Enum 값**:
- `CLEAN`: 청소가 완료된 상태 (깨끗함)
- `DIRTY`: 청소가 필요한 상태
- `MAINTENANCE`: 보수 중인 상태

**⚠️ 중요**: `Room.status`는 **청소/보수 상태만** 표현합니다.
- 실제 사용 여부(예약 중인지)는 `Booking.status`로 판단합니다.
- `CLEAN` 상태라도 예약 중일 수 있고, `DIRTY` 상태라도 예약 가능할 수 있습니다.
- 객실의 물리적 청소 상태와 예약 상태는 독립적으로 관리됩니다.

#### `available`과 `status`의 관계

**독립적 속성**: 두 필드는 서로 독립적으로 동작합니다.

**예시**:
1. `available = true, status = CLEAN`: 활성화 + 청소 완료 → 예약 가능
2. `available = true, status = DIRTY`: 활성화 + 청소 필요 → 청소 후 예약 가능
3. `available = true, status = MAINTENANCE`: 활성화 + 보수 중 → 보수 완료 후 예약 가능
4. `available = false, status = CLEAN`: 비활성화 + 청소 완료 → 예약 불가 (비활성화 우선)
5. `available = false, status = DIRTY`: 비활성화 + 청소 필요 → 예약 불가 (비활성화 우선)

**예약 가능 조건**:
- `available = true` **AND** 날짜 범위에 취소되지 않은 예약이 없어야 함
- `status`는 예약 가능 여부에 직접적인 영향을 주지 않음 (단, 관리자가 수동으로 체크할 수 있음)

**상태 변경 흐름**:
```
CLEAN → DIRTY (체크아웃 시 자동 변경)
DIRTY → CLEAN (청소 완료 후 수동 변경)
CLEAN → MAINTENANCE (보수 시작 시 수동 변경)
MAINTENANCE → CLEAN (보수 완료 후 수동 변경)
```

**자동화**:
- 체크아웃 처리 시: `AdminService.updateBookingStatus()`에서 자동으로 `DIRTY`로 변경
- 청소 완료는 관리자가 수동으로 처리해야 합니다.

**코드 위치**:
- Enum 정의: `Room.java:70-72`
- 체크아웃 시 변경: `AdminService.java:384-390`

### 2.2 예약 상태 (BookingStatus)
**엔티티**: `Booking.java`
**Enum 값**:
- `CONFIRMED`: 예약 확정 (아직 체크인 안 함)
- `CHECKED_IN`: 체크인 완료 (현재 투숙 중)
- `CHECKED_OUT`: 체크아웃 완료
- `CANCELLED`: 예약 취소

**상태 변경 흐름**:
```
CONFIRMED → CHECKED_IN (체크인 처리)
CHECKED_IN → CHECKED_OUT (체크아웃 처리)
CONFIRMED → CANCELLED (예약 취소)
```

**상태 변경 위치**:
- 체크인: `AdminService.updateBookingStatus()` - `CHECKED_IN`으로 변경
- 체크아웃: `AdminService.updateBookingStatus()` - `CHECKED_OUT`으로 변경, 동시에 객실 상태를 `DIRTY`로 변경
- 취소: `BookingService.cancelBooking()` - `CANCELLED`로 변경

**코드 위치**:
- Enum 정의: `Booking.java:66-68`
- 상태 변경: `AdminService.java:388-391`

---

## 3. 데이터베이스 구조

### 3.1 테이블 구조

#### users (사용자)
- `id` (VARCHAR(15), PK): 사용자 아이디
- `password` (VARCHAR, NOT NULL): 비밀번호
- `email` (VARCHAR, UNIQUE, NOT NULL): 이메일
- `nickname` (VARCHAR, NOT NULL): 닉네임
- `role` (VARCHAR, NOT NULL): 역할 (USER, ADMIN)
- `created_at` (TIMESTAMP): 생성일시

**관계**:
- `OneToMany` → `bookings` (예약 목록)
- `OneToMany` → `reviews` (리뷰 목록)

#### rooms (객실)
- `id` (BIGINT, PK, AUTO_INCREMENT): 객실 ID
- `name` (VARCHAR, NOT NULL): 객실명
- `description` (VARCHAR(1000), NOT NULL): 설명
- `type` (VARCHAR, NOT NULL): 타입 (싱글, 더블, 스위트 등)
- `capacity` (INTEGER, NOT NULL): 수용 인원
- `price_per_night` (DECIMAL(10,2), NOT NULL): 1박 가격
- `available` (BOOLEAN, NOT NULL, DEFAULT true): **객실 활성화 여부** (관리자가 객실을 활성화/비활성화)
- `status` (VARCHAR, NOT NULL, DEFAULT 'CLEAN'): **청소/보수 상태** (CLEAN, DIRTY, MAINTENANCE)
- `status_updated_at` (TIMESTAMP): 상태 변경 시간
- `image_url` (VARCHAR): 이미지 URL
- `view_type` (VARCHAR): 뷰 타입 (오션뷰, 마운틴뷰)
- `bed_count` (INTEGER): 침대 개수

**⚠️ 중요: `available`과 `status`의 차이**
- **`available`**: 객실 활성화/비활성화 플래그
  - `true`: 객실이 활성화되어 예약 가능 (기본값)
  - `false`: 객실이 비활성화되어 예약 불가 (관리자가 임시로 객실을 비활성화할 때 사용)
  - 관리자가 `disableRoom()`, `enableRoom()`으로 제어
  - **용도**: 객실 폐쇄, 리모델링, 장기 보수 등으로 객실을 완전히 비활성화할 때 사용
  
- **`status`**: 청소/보수 상태
  - `CLEAN`: 청소 완료 상태
  - `DIRTY`: 청소 필요 상태
  - `MAINTENANCE`: 보수 중 상태
  - **용도**: 일상적인 청소/보수 상태 관리

**예시**:
- `available = false`: 객실이 완전히 비활성화됨 (예약 불가)
- `available = true, status = DIRTY`: 객실은 활성화되어 있지만 청소가 필요함 (청소 후 예약 가능)
- `available = true, status = MAINTENANCE`: 객실은 활성화되어 있지만 보수 중 (보수 완료 후 예약 가능)

**관계**:
- `OneToMany` → `bookings` (예약 목록)
- `OneToMany` → `reviews` (리뷰 목록)

#### bookings (예약)
- `id` (BIGINT, PK, AUTO_INCREMENT): 예약 ID
- `user_id` (VARCHAR(15), FK → users.id, NOT NULL): 사용자 ID
- `room_id` (BIGINT, FK → rooms.id, NOT NULL): 객실 ID
- `check_in_date` (DATE, NOT NULL): 체크인 날짜
- `check_out_date` (DATE, NOT NULL): 체크아웃 날짜
- `guests` (INTEGER, NOT NULL): 인원수
- `total_price` (DECIMAL(10,2), NOT NULL): 총 가격
- `status` (VARCHAR, NOT NULL, DEFAULT 'CONFIRMED'): 상태 (CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
- `special_requests` (VARCHAR(1000)): 특별 요청사항
- `created_at` (TIMESTAMP): 생성일시

**관계**:
- `ManyToOne` → `user` (사용자)
- `ManyToOne` → `room` (객실)
- `OneToOne` → `payment` (결제)

**⚠️ 중요: 예약 중복 방지 제약조건**
- **DB 제약조건**: 현재 데이터베이스 레벨의 UNIQUE 제약조건은 없음
- **애플리케이션 레벨 체크**: 예약 생성 시 애플리케이션에서 중복 체크 수행
- **중복 체크 로직**: 같은 객실의 같은 날짜 범위에 취소되지 않은 예약이 있으면 예약 불가
- **날짜 범위 겹침 조건**: `(checkInDate < checkOutDate) AND (checkOutDate > checkInDate)`
- **코드 위치**: `BookingService.createBooking()`, `BookingRepository.findByRoomAndCheckInDateAndCheckOutDate()`

#### payments (결제)
- `id` (BIGINT, PK, AUTO_INCREMENT): 결제 ID
- `booking_id` (BIGINT, FK → bookings.id, UNIQUE, NOT NULL): 예약 ID
- `amount` (DECIMAL(10,2), NOT NULL): 결제 금액
- `method` (VARCHAR, NOT NULL): 결제 방법 (CARD, BANK_TRANSFER, CASH)
- `status` (VARCHAR, NOT NULL, DEFAULT 'PENDING'): 결제 상태 (PENDING, PAID, FAILED, REFUNDED)
- `payment_date` (TIMESTAMP): 결제일시
- `transaction_id` (VARCHAR): 거래 ID

**관계**:
- `OneToOne` → `booking` (예약)

#### reviews (리뷰)
- `id` (BIGINT, PK, AUTO_INCREMENT): 리뷰 ID
- `user_id` (VARCHAR(15), FK → users.id, NOT NULL): 사용자 ID
- `room_id` (BIGINT, FK → rooms.id, NOT NULL): 객실 ID
- `booking_id` (BIGINT, FK → bookings.id): 예약 ID
- `rating` (INTEGER, NOT NULL): 평점 (1-5)
- `title` (VARCHAR): 제목
- `comment` (TEXT): 내용
- `is_public` (BOOLEAN, DEFAULT true): 공개 여부
- `admin_reply` (TEXT): 관리자 답변
- `admin_reply_date` (TIMESTAMP): 관리자 답변 일시
- `created_at` (TIMESTAMP): 생성일시

**관계**:
- `ManyToOne` → `user` (사용자)
- `ManyToOne` → `room` (객실)
- `ManyToOne` → `booking` (예약)

#### notices (공지사항)
- `id` (BIGINT, PK, AUTO_INCREMENT): 공지사항 ID
- `title` (VARCHAR, NOT NULL): 제목
- `content` (TEXT, NOT NULL): 내용
- `important` (BOOLEAN, DEFAULT false): 중요 공지 여부
- `type` (VARCHAR, NOT NULL): 타입 (NOTICE, EVENT, PROMOTION)
- `is_public` (BOOLEAN, DEFAULT true): 공개 여부
- `start_date` (DATE): 시작일
- `end_date` (DATE): 종료일
- `created_at` (TIMESTAMP): 생성일시
- `updated_at` (TIMESTAMP): 수정일시

#### email_verifications (이메일 인증)
- `id` (BIGINT, PK, AUTO_INCREMENT): 인증 ID
- `email` (VARCHAR, NOT NULL): 이메일
- `code` (VARCHAR, NOT NULL): 인증 코드
- `expires_at` (TIMESTAMP, NOT NULL): 만료 시간
- `verified` (BOOLEAN, DEFAULT false): 인증 완료 여부

### 3.2 데이터베이스 설정
- **DBMS**: PostgreSQL
- **데이터베이스명**: `hoteldb`
- **JPA 설정**: `ddl-auto: update` (자동 스키마 업데이트)
- **설정 파일**: `application.yml`

### 3.3 주요 인덱스 및 제약조건
- `users.id`: UNIQUE, PRIMARY KEY
- `users.email`: UNIQUE
- `payments.booking_id`: UNIQUE (1:1 관계)

### 3.4 JPA CASCADE 설정 현황 및 주의사항

**✅ 코드 수정 완료: 모든 CASCADE 설정을 제거했습니다.**

**실제 호텔/예약 시스템에서는 FK CASCADE를 거의 사용하지 않습니다.**
- 결제 내역/영수증은 법적 증빙 자료이므로 절대 삭제되면 안 됩니다.
- 과거 예약 내역은 회계/통계 목적으로 보존해야 합니다.
- 사용자 삭제 시에도 과거 거래 내역은 보존해야 합니다.

#### 이전 CASCADE 설정 (수정 전)

1. **User → Bookings**: `CascadeType.ALL`
   - **코드 위치**: `User.java:44`
   - **현재 동작**: User 삭제 시 모든 예약이 삭제됨
   - **위험성**: ⚠️ 매우 높음
   - **문제점**: 
     - 사용자가 계정을 삭제하면 과거 예약/결제 내역이 모두 사라짐
     - 회계/통계 데이터 손실
     - 법적 증빙 자료 손실 가능

2. **User → Reviews**: `CascadeType.ALL`
   - **코드 위치**: `User.java:48`
   - **현재 동작**: User 삭제 시 모든 리뷰가 삭제됨
   - **위험성**: ⚠️ 높음
   - **문제점**: 
     - 객실 평점/리뷰 데이터 손실
     - 객실 신뢰도에 영향

3. **Booking → Payment**: `CascadeType.ALL`
   - **코드 위치**: `Booking.java:58`
   - **현재 동작**: Booking 삭제 시 Payment도 삭제됨
   - **위험성**: ⚠️ 매우 높음 (법적 문제 가능)
   - **문제점**: 
     - 결제 내역/영수증이 사라질 수 있음
     - 세무/회계 문제 발생 가능
     - 법적 증빙 자료 손실

4. **Room → Bookings**: `CascadeType.ALL`
   - **코드 위치**: `Room.java:62`
   - **현재 동작**: Room 삭제 시 모든 예약이 삭제됨
   - **위험성**: ⚠️ 매우 높음
   - **문제점**: 
     - 과거 예약 내역 손실
     - 객실 폐쇄 시에도 과거 데이터는 보존해야 함

5. **Room → Reviews**: `CascadeType.ALL`
   - **코드 위치**: `Room.java:66`
   - **현재 동작**: Room 삭제 시 모든 리뷰가 삭제됨
   - **위험성**: ⚠️ 높음
   - **문제점**: 
     - 객실 리뷰 데이터 손실
     - 객실 폐쇄 시에도 리뷰는 보존하는 것이 일반적

#### 권장 정책

**실제 호텔/예약 시스템에서는 CASCADE를 최소화하거나 제거해야 합니다:**

1. **결제(Payment)**: 절대 삭제되면 안 됨 ⚠️
   - `Booking → Payment`: **CASCADE 제거 필수**
   - 결제는 법적 증빙 자료이므로 보존 필요
   - 예약 취소 시에도 결제 내역은 보존
   - 환불 처리 시에도 원본 결제 내역 유지

2. **예약(Booking)**: 삭제보다는 상태 변경 권장 ⚠️
   - `User → Bookings`: **CASCADE 제거 필수**
   - 사용자 삭제 시: `user_id`를 NULL로 변경하거나 삭제 금지
   - 과거 예약 내역은 회계/통계 목적으로 보존 필요
   - `Room → Bookings`: **CASCADE 제거 필수**
   - 객실 삭제 시: 과거 예약은 보존 (객실 폐쇄 시에도)

3. **리뷰(Review)**: 삭제 가능하지만 주의 필요
   - `User → Reviews`: CASCADE 유지 가능 (비즈니스 정책에 따라)
     - 사용자 삭제 시 리뷰도 삭제하는 것이 일반적
   - `Room → Reviews`: **CASCADE 제거 권장**
     - 객실 삭제 시 리뷰는 보존 (객실 폐쇄 시에도 리뷰 보존)

#### 현재 CASCADE 설정 (수정 후)

**✅ 모든 CASCADE 설정을 제거했습니다.**

```java
// User 엔티티 (User.java:44, 49)
@OneToMany(mappedBy = "user")  // CASCADE 제거
private List<Booking> bookings;

@OneToMany(mappedBy = "user")  // CASCADE 제거
private List<Review> reviews;

// Booking 엔티티 (Booking.java:58)
@OneToOne(mappedBy = "booking")  // CASCADE 제거 (결제 보존)
private Payment payment;

// Room 엔티티 (Room.java:62, 67)
@OneToMany(mappedBy = "room")  // CASCADE 제거
private List<Booking> bookings;

@OneToMany(mappedBy = "room")  // CASCADE 제거 (리뷰 보존)
private List<Review> reviews;
```

**수정 완료 날짜**: 2025-12-06

#### 삭제 정책 예시

**사용자 삭제 시**:
- 예약: `user_id`를 NULL로 변경하거나 삭제 금지 (과거 예약 보존)
- 리뷰: 삭제 가능 (비즈니스 정책에 따라, 일반적으로 삭제)
- 결제: 절대 삭제 금지 (법적 증빙 자료)

**예약 삭제 시**:
- 결제: 삭제 금지 (보존 필요, 법적 증빙 자료)
- 리뷰: 연결된 리뷰는 유지 (리뷰는 독립적으로 보존)

**객실 삭제 시**:
- 예약: 삭제 금지 (과거 예약 보존, 객실 폐쇄 시에도)
- 리뷰: 삭제 금지 (객실 리뷰 보존, 객실 폐쇄 시에도)

#### 삭제 처리 시 주의사항

**CASCADE가 제거되었으므로, 삭제 시 수동으로 처리해야 합니다:**

1. **사용자 삭제 시**:
   - 예약: 삭제하지 않고 `user_id`를 NULL로 변경하거나 삭제 금지
   - 리뷰: 삭제 가능 (비즈니스 정책에 따라)
   - 결제: 절대 삭제 금지

2. **예약 삭제 시**:
   - 결제: 삭제 금지 (보존 필요)
   - 리뷰: 연결된 리뷰는 유지

3. **객실 삭제 시**:
   - 예약: 삭제 금지 (과거 예약 보존)
   - 리뷰: 삭제 금지 (객실 리뷰 보존)

**대안 구현** (향후 고려사항):
- 삭제 대신 "soft delete" 패턴 사용 (deleted_at 컬럼 추가)
- 또는 삭제 시 FK를 NULL로 변경하는 로직 구현
- 결제는 절대 삭제하지 않고 상태만 변경 (REFUNDED 등)

---

## 4. API 엔드포인트

### 4.1 대시보드 관련
- `GET /api/admin/dashboard?year={year}&month={month}`: 대시보드 데이터 조회
- `GET /api/admin/rooms/status-summary`: 객실 상태 요약
- `GET /api/admin/bookings/today-checkins`: 오늘 체크인 목록
- `GET /api/admin/bookings/today-checkouts`: 오늘 체크아웃 목록
- `GET /api/admin/bookings/current-stays`: 현재 투숙 중 목록
- `GET /api/admin/bookings/stats?year={year}&month={month}`: 월별 통계
- `GET /api/admin/statistics?startYear={startYear}&endYear={endYear}`: 통계 분석

### 4.2 관리 기능
- 객실 관리: CRUD 작업
- 예약 관리: 상태 변경, 조회
- 리뷰 관리: 공개/비공개, 답변 작성
- 공지사항 관리: CRUD 작업

---

## 5. 통계 계산 방법 상세

### ⚠️ 중요: 계산 기준 통일
**모든 통계는 예약(Reservation) 기준으로만 계산합니다.**
- 객실 상태와 섞지 않음
- 예약 상태와 날짜만으로 판단

### 5.1 예약 (booked)
**의미**: 아직 체크인하지 않은 미래 예약 개수

**조건**:
- 예약 상태가 `CONFIRMED` (확정됨)
- 체크인 날짜가 오늘 또는 오늘 이후 (`check_in_date >= 오늘`)

**제외되는 예약**:
- `CHECKED_IN` (이미 체크인 완료)
- `CHECKED_OUT` (체크아웃 완료)
- `CANCELLED` (취소됨)
- 체크인 날짜가 과거인 예약

**예시**:
```
예약 ID 17: status=CONFIRMED, check_in_date=2025-12-23 → 포함
예약 ID 26: status=CHECKED_IN → 제외 (이미 체크인함)
예약 ID 15: status=CANCELLED → 제외 (취소됨)
```

### 5.2 청소 완료 객실 (available)
**의미**: 청소가 완료된 객실 개수 (청소 상태 기준)

**조건**:
- `status = 'CLEAN'`

**설명**:
- 객실의 청소 상태만으로 판단 (예약과 무관)
- 예약 여부와 관계없이 객실의 청소 상태가 CLEAN이면 포함
- **⚠️ 중요**: 이는 **청소 완료 상태**를 의미하며, **예약 가능 여부와는 무관**합니다.
  - `CLEAN` 상태라도 예약 중일 수 있습니다 (`Booking.status = CHECKED_IN`)
  - 실제 예약 가능 여부는 `Booking.status`를 확인해야 합니다.

**계산 기준**: 객실(Room) 기준만 사용 - 예약과 엮어서 복잡하게 따지지 않음

**예시**:
```
객실 A: status=CLEAN, Booking.status=CHECKED_IN → 포함 (청소 완료 상태이지만 예약 중)
객실 B: status=CLEAN, 예약 없음 → 포함 (청소 완료 상태)
객실 C: status=DIRTY → 제외 (청소 필요 상태)
객실 D: status=MAINTENANCE → 제외 (보수 중 상태)
```

### 5.3 청소 필요 (cleaningNeeded)
**의미**: 청소가 필요한 객실 개수 (청소 상태 기준)

**조건**:
- `status = 'DIRTY'`

**설명**:
- 체크아웃 처리 시 자동으로 이 상태로 변경됨
- 청소 완료 후 `CLEAN` 상태로 변경 가능
- **주의**: 이는 청소 상태만을 나타내며, 실제 사용 여부와는 무관합니다.

**계산 기준**: 객실(Room) 기준만 사용 - 예약과 엮어서 복잡하게 따지지 않음

### 5.4 보수 중 (maintenance)
**의미**: 보수 작업 중인 객실 개수 (보수 상태 기준)

**조건**:
- `status = 'MAINTENANCE'`

**설명**:
- 수동으로 관리자가 설정
- 보수 완료 후 `CLEAN` 상태로 변경 가능
- **주의**: 이는 보수 상태만을 나타내며, 실제 사용 여부와는 무관합니다.

**계산 기준**: 객실(Room) 기준만 사용 - 예약과 엮어서 복잡하게 따지지 않음

### 5.5 오늘 체크인 (todayCheckIns)
**의미**: 오늘 체크인 예정인 예약 목록

**조건** (모두 만족해야 함):
- 예약 상태가 `CONFIRMED` (확정됨)
- 체크인 날짜가 오늘 (`check_in_date = 오늘`)

**제외되는 예약**:
- `CHECKED_IN` 상태 (이미 체크인 완료)
- `CANCELLED` 상태 (취소됨)
- 체크인 날짜가 오늘이 아닌 예약

**주의**:
- 오늘 체크인 예정인 예약을 이미 체크인 처리하면 이 목록에서 사라지고 "현재 투숙 중"으로 이동

**계산 기준**: 예약(Reservation) 기준만 사용 - 객실 상태와 무관

### 5.6 현재 투숙 중 (currentStays)
**의미**: 지금 사용 중인 예약

**조건**:
- 예약 상태가 `CHECKED_IN`

**설명**:
- 체크인 완료된 모든 예약을 포함
- 체크아웃 날짜와 무관하게 `CHECKED_IN` 상태면 모두 포함
- **예약(Reservation) 기준으로만 계산** - 객실 상태와 무관

**계산 기준**: 예약(Reservation) 기준만 사용

### 5.7 오늘 체크아웃 (todayCheckOuts)
**의미**: 오늘 체크아웃 예정인 예약 목록

**조건** (모두 만족해야 함):
- 예약 상태가 `CHECKED_IN` (체크인 완료 상태)
- 체크아웃 날짜가 오늘 (`check_out_date = 오늘`)

**제외되는 예약**:
- `CONFIRMED` 상태 (아직 체크인 안 함)
- `CHECKED_OUT` 상태 (이미 체크아웃 완료)
- `CANCELLED` 상태 (취소됨)
- 체크아웃 날짜가 오늘이 아닌 예약

**계산 기준**: 예약(Reservation) 기준만 사용 - 객실 상태와 무관

### 5.8 계산 기준 통일 요약

**예약(Reservation) 기준으로만 계산하는 항목**:
1. **예약(booked)**: `CONFIRMED` + 미래/오늘 체크인
2. **오늘 체크인**: `CONFIRMED` + 오늘 체크인
3. **현재 투숙 중**: `CHECKED_IN`
4. **오늘 체크아웃**: `CHECKED_IN` + 오늘 체크아웃

**객실(Room) 기준으로만 계산하는 항목**:
1. **청소 완료 객실**: `status = CLEAN` (청소 상태 기준, 예약 가능 여부와 무관)
2. **청소 필요**: `status = DIRTY`
3. **보수 중**: `status = MAINTENANCE`

**중요**: 예약 기준 항목과 객실 기준 항목은 서로 독립적으로 계산됨
- 예약 기준: 예약 상태와 날짜만으로 판단 (객실 상태와 무관)
- 객실 기준: 객실 상태만으로 판단 (예약과 무관)

### 5.9 상태 흐름
```
예약 상태:
CONFIRMED → CHECKED_IN → CHECKED_OUT
           (체크인)     (체크아웃)

객실 상태:
CLEAN → DIRTY → CLEAN
       (체크아웃) (수동 청소 완료)
```

### 5.10 중복/겹침 주의사항
1. **예약 vs 청소 완료 객실**: 
   - "예약"은 예약 개수, "청소 완료 객실"은 청소 상태가 CLEAN인 객실 개수
   - **주의**: 청소 완료 객실과 예약은 독립적입니다.
   - 청소 완료 상태(`CLEAN`)라도 예약 중일 수 있습니다.

2. **오늘 체크인 vs 현재 투숙 중**:
   - "오늘 체크인" = CONFIRMED이고 오늘 체크인 날짜
   - "현재 투숙 중" = CHECKED_IN 상태
   - 같은 예약은 두 목록에 동시에 나타나지 않음

3. **청소 완료 vs 현재 투숙 중**:
   - **서로 독립적** (겹칠 수 있음)
   - "청소 완료" = 청소 상태가 CLEAN인 객실 (예약과 무관)
   - "현재 투숙 중" = 예약 상태가 CHECKED_IN인 예약
   - 예: `Room.status = CLEAN`이고 `Booking.status = CHECKED_IN`인 경우, 두 항목 모두에 포함될 수 있음

---

## 6. 객실 상태 관리

### 6.1 자동화 기능

#### 체크아웃 → DIRTY (자동)
- 체크아웃 처리 시 자동으로 객실 상태를 `DIRTY`로 변경
- **위치**: `AdminService.updateBookingStatus()`

```java
if (status == Booking.BookingStatus.CHECKED_OUT) {
    Room room = booking.getRoom();
    room.setStatus(Room.RoomStatus.DIRTY);
    room.setStatusUpdatedAt(LocalDateTime.now());  // 상태 변경 시간 기록
    roomRepository.save(room);
}
```

### 6.2 상태 변경 방법

#### DIRTY → CLEAN (수동)
- 관리자가 수동으로 청소 완료 처리
- **위치**: `AdminService.updateRoomStatus()`
- 관리자 대시보드에서 객실 상태를 직접 변경

#### Room 엔티티
**파일**: `bookBE/src/main/java/com/hotel/booking/room/entity/Room.java`

```java
@Column(name = "status_updated_at")
private LocalDateTime statusUpdatedAt;  // 상태 변경 시간 기록용
```

**목적**: 
- 객실 상태가 변경된 시간을 추적
- 상태 변경 이력 관리에 사용

### 6.3 동작 흐름

#### 전체 흐름
```
1. [고객 체크아웃]
   ↓
2. 관리자가 체크아웃 처리
   ↓
3. Room.status = DIRTY (자동)
   Room.statusUpdatedAt = 현재 시간 (자동 기록)
   ↓
4. [청소 작업]
   ↓
5. 관리자가 청소 완료 처리 (수동)
   ↓
6. Room.status = CLEAN (수동 변경)
   Room.statusUpdatedAt = 현재 시간 (업데이트)
   ↓
7. [객실 청소 완료 상태]
```

#### 시나리오 예시

**시나리오: 정상 처리**
```
14:00 - 체크아웃 처리
        Room.status = DIRTY (자동)
        Room.statusUpdatedAt = 14:00
        
15:30 - 청소 작업 완료
        
16:00 - 관리자가 수동으로 청소 완료 처리
        Room.status = CLEAN (수동 변경)
        Room.statusUpdatedAt = 16:00
```


## 7. 계산 기준 요약

### 예약(Reservation) 기준 항목
- 예약(booked)
- 오늘 체크인
- 현재 투숙 중
- 오늘 체크아웃

### 객실(Room) 기준 항목 (청소/보수 상태만)
- 청소 완료 객실 (청소 완료 상태 = CLEAN)
- 청소 필요 (청소 필요 상태 = DIRTY)
- 보수 중 (보수 중 상태 = MAINTENANCE)

**⚠️ 중요**: 객실 기준 항목은 **청소/보수 상태만** 표현하며, 실제 사용 여부는 예약 기준 항목으로 판단합니다.
- `CLEAN` 상태는 "청소 완료"를 의미하며, "예약 가능"을 의미하지 않습니다.
- 실제 예약 가능 여부는 `Booking.status`를 확인해야 합니다.

### 혼합 기준 항목
- 현재 사용 중인 객실 (예약 상태 + 객실 조회)

---

## 8. 예약 중복 방지 (Overbooking Prevention)

### 8.1 개요

**예약 중복(Overbooking)은 호텔 예약 시스템의 가장 중요한 비즈니스 로직 중 하나입니다.**

같은 객실을 같은 날짜에 중복 예약하는 것을 방지해야 합니다.

**예시 시나리오**:
```
Room 101
- 예약 A: 12/10 ~ 12/12 (체크인: 12/10, 체크아웃: 12/12)
- 예약 B: 12/11 ~ 12/13 (체크인: 12/11, 체크아웃: 12/13) ← 중복 예약! 막아야 함
```

### 8.2 날짜 범위 겹침 조건

두 예약이 겹치는 조건:
```
예약 A: [checkInDate_A, checkOutDate_A)
예약 B: [checkInDate_B, checkOutDate_B)

겹침 조건: (checkInDate_A < checkOutDate_B) AND (checkOutDate_B > checkInDate_A)
```

**구체적 예시**:
- 예약 A: 12/10 ~ 12/12
- 예약 B: 12/11 ~ 12/13
- 겹침: (12/10 < 12/13) AND (12/13 > 12/10) = TRUE → 중복 예약 불가

### 8.3 구현 방식

#### 애플리케이션 레벨 체크

**코드 위치**: `BookingService.createBooking()`

```java
// 중복 예약 확인 (같은 객실의 같은 날짜 범위에 예약이 있는지 체크)
List<Booking> overlappingBookings = bookingRepository.findByRoomAndCheckInDateAndCheckOutDate(
        room, request.getCheckInDate(), request.getCheckOutDate());

// 취소되지 않은 예약이 있는지 확인
boolean hasOverlap = overlappingBookings.stream()
        .anyMatch(b -> b.getStatus() != Booking.BookingStatus.CANCELLED);

if (hasOverlap) {
    throw new RuntimeException("선택한 날짜에 이미 예약이 있습니다. 다른 날짜를 선택해주세요.");
}
```

**Repository 쿼리**: `BookingRepository.findByRoomAndCheckInDateAndCheckOutDate()`

```java
@Query("SELECT b FROM Booking b WHERE b.room = :room " +
       "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
List<Booking> findByRoomAndCheckInDateAndCheckOutDate(
        @Param("room") Room room,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate);
```

### 8.4 취소된 예약 처리

**중요**: 취소된 예약(`CANCELLED`)은 중복 체크에서 제외됩니다.

- 취소된 예약이 있는 날짜에도 새 예약이 가능합니다.
- 취소된 예약은 날짜 범위 겹침 체크에서 제외됩니다.

### 8.5 동시성 문제 (Race Condition)

**현재 구현의 한계**:
- 두 사용자가 동시에 같은 객실을 예약하려고 할 때, 둘 다 중복 체크를 통과할 수 있습니다.
- 이는 트랜잭션 격리 수준과 관련된 문제입니다.

**완화 방법**:
1. **트랜잭션 격리 수준**: `@Transactional(isolation = Isolation.SERIALIZABLE)` 사용 (성능 저하 가능)
2. **비관적 락**: `@Lock(LockModeType.PESSIMISTIC_WRITE)` 사용
3. **DB 제약조건**: PostgreSQL의 `EXCLUDE` 제약조건 사용 (추가 구현 필요)

**현재 상태**: 애플리케이션 레벨 체크만 수행 (동시성 문제 완전 방지는 어려움)

### 8.6 DB 제약조건 (향후 개선 사항)

**현재**: DB 레벨의 UNIQUE 제약조건 없음

**권장 개선**:
PostgreSQL의 `EXCLUDE` 제약조건을 사용하여 DB 레벨에서 중복 방지:

```sql
-- PostgreSQL EXCLUDE 제약조건 예시
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in_date, check_out_date) WITH &&
) WHERE (status != 'CANCELLED');
```

이 제약조건은:
- 같은 `room_id`에 대해
- 날짜 범위(`daterange`)가 겹치는(`&&`) 경우
- 취소되지 않은(`status != 'CANCELLED'`) 예약을 방지합니다.

### 8.7 테스트 시나리오

**정상 케이스**:
- Room 101: 12/10 ~ 12/12 예약 → 성공
- Room 101: 12/13 ~ 12/15 예약 → 성공 (날짜가 겹치지 않음)

**중복 예약 시도**:
- Room 101: 12/10 ~ 12/12 예약 → 성공
- Room 101: 12/11 ~ 12/13 예약 → 실패 (날짜가 겹침)

**취소 후 재예약**:
- Room 101: 12/10 ~ 12/12 예약 → 성공
- Room 101: 12/10 ~ 12/12 예약 취소 → 성공
- Room 101: 12/10 ~ 12/12 새 예약 → 성공 (취소된 예약은 중복 체크에서 제외)

### 8.8 코드 위치

- **서비스**: `bookBE/src/main/java/com/hotel/booking/booking/service/BookingService.java:55-60`
- **리포지토리**: `bookBE/src/main/java/com/hotel/booking/booking/repository/BookingRepository.java:19-24`

---

## 참고 파일
- 서비스 구현: `bookBE/src/main/java/com/hotel/booking/admin/service/AdminService.java`
- 컨트롤러: `bookBE/src/main/java/com/hotel/booking/admin/controller/AdminController.java`
- 객실 엔티티: `bookBE/src/main/java/com/hotel/booking/room/entity/Room.java`
- 예약 엔티티: `bookBE/src/main/java/com/hotel/booking/booking/entity/Booking.java`

