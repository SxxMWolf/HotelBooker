# 호텔 예약 시스템 테스트 가이드

## 🚀 애플리케이션 접속

현재 애플리케이션은 **포트 8081**에서 실행 중입니다.

**접속 URL:** http://localhost:8081

---

## 📋 테스트 시나리오

### 1. 기본 접속 테스트

1. **홈페이지 접속**
   - 브라우저에서 `http://localhost:8081` 접속
   - 방 목록과 공지사항이 표시되는지 확인

2. **로그인 페이지**
   - `http://localhost:8081/login` 접속
   - 로그인 폼이 표시되는지 확인

3. **회원가입 페이지**
   - `http://localhost:8081/register` 접속
   - 회원가입 폼이 표시되는지 확인

---

### 2. 사용자 계정 생성 및 테스트

#### 방법 1: 웹 인터페이스를 통한 회원가입

1. `http://localhost:8081/register` 접속
2. 다음 정보 입력:
   - 아이디: `testuser`
   - 비밀번호: `password123`
   - 이메일: `test@example.com`
   - 이름: `테스트 사용자`
3. 회원가입 완료 후 로그인

#### 방법 2: 데이터베이스에 직접 관리자 계정 생성

PostgreSQL에 접속하여 관리자 계정을 생성할 수 있습니다:

```sql
-- PostgreSQL에 접속
psql -U sxxm -d hoteldb

-- 관리자 계정 생성 (비밀번호는 BCrypt로 암호화 필요)
-- 실제로는 애플리케이션을 통해 회원가입하거나, 
-- UserService를 사용하여 생성하는 것이 좋습니다.
```

---

### 3. 고객(Customer) 기능 테스트

#### 로그인 후 테스트할 기능:

1. **방 목록 조회**
   - URL: `http://localhost:8081/customer/rooms`
   - 체크인/체크아웃 날짜로 검색 가능
   - 예: `http://localhost:8081/customer/rooms?checkIn=2025-12-01&checkOut=2025-12-03`

2. **방 상세 정보**
   - URL: `http://localhost:8081/customer/rooms/{roomId}`
   - 방 정보, 예약 가능 여부 확인

3. **예약하기**
   - 방 상세 페이지에서 예약 버튼 클릭
   - 체크인/체크아웃 날짜 선택
   - 예약 정보 확인 및 결제

4. **내 예약 내역**
   - URL: `http://localhost:8081/customer/bookings`
   - 예약한 방 목록 확인

5. **리뷰 작성**
   - URL: `http://localhost:8081/customer/reviews`
   - 예약한 방에 대한 리뷰 작성

6. **공지사항 조회**
   - URL: `http://localhost:8081/customer/notices`
   - 공지사항 목록 및 상세 내용 확인

7. **프로필 관리**
   - URL: `http://localhost:8081/customer/profile`
   - 개인정보 수정

---

### 4. 관리자(Admin) 기능 테스트

관리자 계정으로 로그인하면 자동으로 `/admin/dashboard`로 리다이렉트됩니다.

#### 관리자 기능:

1. **대시보드**
   - URL: `http://localhost:8081/admin/dashboard`
   - 오늘 체크인/체크아웃 현황
   - 방 현황 통계

2. **방 관리**
   - 방 목록: `http://localhost:8081/admin/rooms`
   - 방 추가: `http://localhost:8081/admin/rooms/new`
   - 방 수정/삭제

3. **예약 관리**
   - URL: `http://localhost:8081/admin/bookings`
   - 모든 예약 내역 조회 및 관리

4. **리뷰 관리**
   - URL: `http://localhost:8081/admin/reviews`
   - 고객 리뷰 조회 및 답변 작성

5. **공지사항 관리**
   - 공지사항 목록: `http://localhost:8081/admin/notices`
   - 공지사항 작성: `http://localhost:8081/admin/notices/new`
   - 공지사항 수정/삭제

---

## 🧪 API 테스트 (curl 사용)

### 1. 홈페이지 접속 테스트
```bash
curl http://localhost:8081/
```

### 2. 로그인 테스트
```bash
curl -X POST http://localhost:8081/login \
  -d "username=testuser&password=password123" \
  -c cookies.txt \
  -L
```

### 3. 인증된 요청 테스트
```bash
# 로그인 후 쿠키를 사용하여 인증된 요청
curl http://localhost:8081/customer/rooms \
  -b cookies.txt
```

---

## 📝 초기 데이터 설정

### 테스트용 방 데이터 생성

데이터베이스에 직접 방 데이터를 추가하려면:

```sql
-- PostgreSQL 접속
psql -U sxxm -d hoteldb

-- 방 데이터 삽입 예시
INSERT INTO rooms (room_number, room_type, price, capacity, description, amenities, status, created_at, updated_at)
VALUES 
  ('101', 'STANDARD', 100000, 2, '스탠다드 룸입니다', 'WiFi, TV, 에어컨', 'AVAILABLE', NOW(), NOW()),
  ('201', 'DELUXE', 150000, 3, '디럭스 룸입니다', 'WiFi, TV, 에어컨, 미니바', 'AVAILABLE', NOW(), NOW()),
  ('301', 'SUITE', 250000, 4, '스위트 룸입니다', 'WiFi, TV, 에어컨, 미니바, 욕조', 'AVAILABLE', NOW(), NOW());
```

---

## 🔍 주요 테스트 체크리스트

### ✅ 기본 기능
- [ ] 홈페이지 접속 가능
- [ ] 회원가입 가능
- [ ] 로그인/로그아웃 가능
- [ ] 방 목록 조회 가능
- [ ] 방 상세 정보 확인 가능

### ✅ 고객 기능
- [ ] 방 예약 가능
- [ ] 예약 내역 조회 가능
- [ ] 결제 진행 가능
- [ ] 리뷰 작성 가능
- [ ] 공지사항 조회 가능
- [ ] 프로필 수정 가능

### ✅ 관리자 기능
- [ ] 대시보드 접근 가능
- [ ] 방 추가/수정/삭제 가능
- [ ] 예약 관리 가능
- [ ] 리뷰 관리 및 답변 작성 가능
- [ ] 공지사항 작성/수정/삭제 가능

---

## 🐛 문제 해결

### 포트 충돌
- 포트 8081이 사용 중이면 `application.properties`에서 `server.port`를 다른 포트로 변경

### 데이터베이스 연결 오류
- PostgreSQL 서버가 실행 중인지 확인: `brew services list | grep postgresql`
- 데이터베이스가 존재하는지 확인: `psql -U sxxm -d hoteldb -c "\dt"`

### 로그인 실패
- 사용자가 존재하는지 확인
- 비밀번호가 올바른지 확인
- 데이터베이스에서 사용자 정보 확인

---

## 📞 추가 도움말

애플리케이션 로그는 터미널에서 확인할 수 있습니다.
실행 중인 애플리케이션의 로그를 확인하여 오류를 진단할 수 있습니다.

