-- 호텔 예약 시스템 테스트용 초기 데이터
-- 사용법: psql -U sxxm -d hoteldb -f init_test_data.sql

-- 1. 테스트용 방 데이터 생성
INSERT INTO rooms (room_number, room_type, price, capacity, description, amenities, status, created_at, updated_at)
VALUES 
  ('101', 'STANDARD', 100000, 2, '깔끔하고 편안한 스탠다드 룸입니다. 모든 기본 시설이 갖춰져 있습니다.', 'WiFi, TV, 에어컨, 냉장고', 'AVAILABLE', NOW(), NOW()),
  ('102', 'STANDARD', 100000, 2, '도시 전망이 아름다운 스탠다드 룸입니다.', 'WiFi, TV, 에어컨, 냉장고', 'AVAILABLE', NOW(), NOW()),
  ('201', 'DELUXE', 150000, 3, '넓고 쾌적한 디럭스 룸입니다. 추가 편의시설을 제공합니다.', 'WiFi, TV, 에어컨, 미니바, 전자레인지', 'AVAILABLE', NOW(), NOW()),
  ('202', 'DELUXE', 150000, 3, '가족 여행에 적합한 디럭스 룸입니다.', 'WiFi, TV, 에어컨, 미니바, 전자레인지', 'AVAILABLE', NOW(), NOW()),
  ('301', 'SUITE', 250000, 4, '최고급 스위트 룸입니다. 프리미엄 서비스를 제공합니다.', 'WiFi, TV, 에어컨, 미니바, 욕조, 발코니', 'AVAILABLE', NOW(), NOW()),
  ('302', 'SUITE', 250000, 4, '럭셔리한 스위트 룸입니다. 최상의 편안함을 제공합니다.', 'WiFi, TV, 에어컨, 미니바, 욕조, 발코니', 'AVAILABLE', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. 테스트용 공지사항 생성
INSERT INTO notices (title, content, is_active, created_at, updated_at)
VALUES 
  ('환영합니다!', '호텔 예약 시스템에 오신 것을 환영합니다. 편리한 서비스를 이용해주세요.', true, NOW(), NOW()),
  ('시스템 점검 안내', '2025년 12월 1일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.', true, NOW(), NOW()),
  ('연말 특가 이벤트', '12월 한 달간 모든 룸 20% 할인 이벤트를 진행합니다. 많은 이용 부탁드립니다.', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 참고: 사용자 계정은 웹 인터페이스를 통해 회원가입하거나
-- UserService를 사용하여 생성하는 것이 좋습니다.
-- 비밀번호는 BCrypt로 암호화되어야 하므로 직접 SQL로 삽입하기 어렵습니다.

