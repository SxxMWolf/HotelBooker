-- ============================================
-- 호텔 예약 시스템 샘플 데이터
-- DBeaver에서 직접 실행하세요
-- ============================================

-- 기존 데이터 삭제 (선택사항 - 필요시 주석 해제)
-- DELETE FROM reviews;
-- DELETE FROM payments;
-- DELETE FROM bookings;
-- DELETE FROM users;
-- DELETE FROM notices;
-- DELETE FROM rooms;

-- ============================================
-- 객실 데이터 삽입
-- 방 종류: 싱글(20개), 더블(15개), 패밀리(5개), 프리미엄(3개)
-- 순서: 싱글 → 더블 → 패밀리 → 프리미엄
-- id는 1부터 순차적으로 증가
-- ============================================

-- 기존 rooms 데이터 삭제
DELETE FROM rooms;

-- 시퀀스 리셋
SELECT setval('rooms_id_seq', 1, false);

-- 1. 싱글 룸 (20개) - id 1~20 (50만원)
-- 앞 10개는 오션뷰, 뒤 10개는 마운틴뷰
INSERT INTO rooms (name, description, type, capacity, price_per_night, available, image_url, view_type, bed_count)
SELECT 
  '싱글' || LPAD(num::text, 2, '0'),
  '아늑하고 편안한 싱글 룸으로, 혼자 여행하시는 분들에게 최적화된 공간입니다. 프리미엄 침대와 최신 시설을 갖추고 있습니다.',
  '싱글',
  1,
  500000.00,
  true,
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  CASE WHEN num <= 10 THEN '오션뷰' ELSE '마운틴뷰' END,
  1
FROM generate_series(1, 20) AS num;

-- 2. 더블 룸 (15개) - id 21~35 (80만원)
-- 앞 8개는 오션뷰, 뒤 7개는 마운틴뷰
INSERT INTO rooms (name, description, type, capacity, price_per_night, available, image_url, view_type, bed_count)
SELECT 
  '더블' || LPAD(num::text, 2, '0'),
  '커플이나 친구와 함께 머물기에 완벽한 더블 룸입니다. 넓은 공간과 아늑한 분위기로 편안한 휴식을 제공합니다.',
  '더블',
  2,
  800000.00,
  true,
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  CASE WHEN num <= 8 THEN '오션뷰' ELSE '마운틴뷰' END,
  1
FROM generate_series(1, 15) AS num;

-- 3. 패밀리 룸 (5개) - id 36~40 (180만원)
-- 앞 3개는 오션뷰, 뒤 2개는 마운틴뷰
INSERT INTO rooms (name, description, type, capacity, price_per_night, available, image_url, view_type, bed_count)
SELECT 
  '패밀리' || LPAD(num::text, 2, '0'),
  '가족 여행에 최적화된 넓은 패밀리 룸입니다. 최대 4명까지 수용 가능하며, 아이들을 위한 안전한 환경을 제공합니다.',
  '패밀리',
  4,
  1800000.00,
  true,
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
  CASE WHEN num <= 3 THEN '오션뷰' ELSE '마운틴뷰' END,
  2
FROM generate_series(1, 5) AS num;

-- 4. 프리미엄 룸 (3개) - id 41~43 (250만원)
-- 앞 2개는 오션뷰, 뒤 1개는 마운틴뷰
INSERT INTO rooms (name, description, type, capacity, price_per_night, available, image_url, view_type, bed_count)
SELECT 
  '프리미엄' || LPAD(num::text, 2, '0'),
  '최고급 시설과 서비스를 제공하는 프리미엄 룸입니다. 전용 발코니와 최신 시설을 갖추고 있습니다.',
  '프리미엄',
  2,
  2500000.00,
  true,
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  CASE WHEN num <= 2 THEN '오션뷰' ELSE '마운틴뷰' END,
  1
FROM generate_series(1, 3) AS num;

-- ============================================
-- 공지사항 데이터 삽입
-- ============================================
INSERT INTO notices (title, content, important, created_at, updated_at) VALUES
('환영합니다! 호텔 예약 시스템 오픈', '안녕하세요. 호텔 예약 시스템에 오신 것을 환영합니다. 편리한 온라인 예약 서비스를 이용해 주셔서 감사합니다. 궁금한 사항이 있으시면 언제든지 문의해 주세요.', true, NOW(), NOW()),
('체크인/체크아웃 안내', '체크인 시간은 오후 3시, 체크아웃 시간은 오전 11시입니다. 조기 체크인이나 늦은 체크아웃이 필요하시면 사전에 연락 주시기 바랍니다.', false, NOW(), NOW()),
('환불 정책 안내', '예약 취소는 체크인 3일 전까지 100% 환불이 가능합니다. 2일 전 취소 시 50% 환불, 1일 전 또는 당일 취소 시 환불이 불가능합니다.', false, NOW(), NOW()),
('시설 이용 안내', '호텔 내 레스토랑, 수영장, 피트니스 센터 등 모든 시설을 이용하실 수 있습니다. 이용 시간은 각 시설마다 상이하니 프론트 데스크에 문의해 주세요.', false, NOW(), NOW()),
('주차 안내', '호텔 지하 주차장을 이용하실 수 있으며, 1박당 10,000원의 주차비가 발생합니다. 주차 공간이 제한되어 있으니 사전 예약을 권장합니다.', false, NOW(), NOW()),
('프로모션 안내', '이번 달 신규 회원 가입 시 첫 예약 20% 할인 혜택을 제공합니다. 자세한 내용은 이벤트 페이지를 확인해 주세요.', true, NOW(), NOW()),
('COVID-19 안전 수칙', '고객님의 안전을 위해 마스크 착용과 손 소독을 권장합니다. 체온 측정 및 건강 상태 확인이 필요할 수 있습니다.', true, NOW(), NOW()),
('와이파이 이용 안내', '호텔 전체에서 무료 와이파이를 이용하실 수 있습니다. 비밀번호는 체크인 시 안내해 드립니다.', false, NOW(), NOW());

-- ============================================
-- 사용자 데이터 삽입
-- 비밀번호: password123 (BCrypt 해시)
-- ============================================
INSERT INTO users (id, password, email, nickname, role, created_at) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@hotel.com', '관리자', 'ADMIN', NOW() - INTERVAL '30 days'),
('user01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user01@example.com', '홍길동', 'USER', NOW() - INTERVAL '25 days'),
('user02', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user02@example.com', '김영희', 'USER', NOW() - INTERVAL '20 days'),
('user03', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user03@example.com', '이철수', 'USER', NOW() - INTERVAL '15 days'),
('user04', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user04@example.com', '박민수', 'USER', NOW() - INTERVAL '10 days'),
('user05', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user05@example.com', '최지영', 'USER', NOW() - INTERVAL '5 days');

-- ============================================
-- 예약 데이터 삽입
-- 가격: 싱글(50만원), 더블(80만원), 스위트(120만원), 패밀리(180만원), 프리미엄(250만원)
-- ============================================
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests, total_price, status, created_at) VALUES
('user01', 1, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 1, 1000000.00, 'CONFIRMED', NOW() - INTERVAL '10 days'),  -- 싱글 2박
('user01', 21, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '8 days', 2, 1600000.00, 'COMPLETED', NOW() - INTERVAL '20 days'),  -- 더블 2박
('user02', 36, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '5 days', 2, 2400000.00, 'PENDING', NOW() - INTERVAL '2 days'),  -- 스위트 2박
('user02', 46, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '12 days', 4, 5400000.00, 'COMPLETED', NOW() - INTERVAL '18 days'),  -- 패밀리 3박
('user03', 51, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 2, 7500000.00, 'CONFIRMED', NOW() - INTERVAL '5 days'),  -- 프리미엄 3박
('user03', 21, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 2, 1600000.00, 'COMPLETED', NOW() - INTERVAL '8 days'),  -- 더블 2박
('user04', 5, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', 1, 1000000.00, 'PENDING', NOW() - INTERVAL '1 day'),  -- 싱글 2박
('user04', 50, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '17 days', 4, 5400000.00, 'COMPLETED', NOW() - INTERVAL '22 days'),  -- 패밀리 3박
('user05', 1, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 1, 1000000.00, 'CONFIRMED', NOW() - INTERVAL '3 days'),  -- 싱글 2박
('user05', 22, CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '6 days', 2, 1600000.00, 'CANCELLED', NOW() - INTERVAL '12 days');  -- 더블 2박

-- ============================================
-- 결제 데이터 삽입 (서브쿼리로 booking_id 찾기)
-- ============================================
INSERT INTO payments (booking_id, amount, method, status, payment_date, transaction_id)
SELECT 
  b.id,
  b.total_price,
  CASE 
    WHEN (ROW_NUMBER() OVER (ORDER BY b.id)) % 3 = 1 THEN 'CARD'
    WHEN (ROW_NUMBER() OVER (ORDER BY b.id)) % 3 = 2 THEN 'BANK_TRANSFER'
    ELSE 'CASH'
  END,
  CASE 
    WHEN b.status = 'CANCELLED' THEN 'REFUNDED'
    WHEN b.status = 'PENDING' THEN 'PENDING'
    ELSE 'COMPLETED'
  END,
  CASE 
    WHEN b.status != 'PENDING' AND b.status != 'CANCELLED' THEN NOW() - INTERVAL '1 day' * (10 - (ROW_NUMBER() OVER (ORDER BY b.id)))
    ELSE NULL
  END,
  CASE 
    WHEN b.status != 'PENDING' AND b.status != 'CANCELLED' THEN 'TXN-' || LPAD((ROW_NUMBER() OVER (ORDER BY b.id))::text, 10, '0')
    ELSE NULL
  END
FROM bookings b
WHERE b.status != 'CANCELLED'
ORDER BY b.id
LIMIT 9;

-- ============================================
-- 리뷰 데이터 삽입 (서브쿼리로 booking_id 찾기)
-- ============================================
-- COMPLETED 상태인 예약에 대한 리뷰 (booking_id가 실제로 존재하는 경우만)
INSERT INTO reviews (user_id, room_id, booking_id, rating, comment, created_at)
SELECT 
  b.user_id,
  b.room_id,
  b.id,
  CASE 
    WHEN b.room_id BETWEEN 21 AND 35 THEN 5  -- 더블 룸
    WHEN b.room_id BETWEEN 36 AND 45 THEN 4  -- 스위트 룸
    WHEN b.room_id BETWEEN 46 AND 50 THEN 4  -- 패밀리 룸
    WHEN b.room_id BETWEEN 51 AND 53 THEN 5  -- 프리미엄 룸
    ELSE 4
  END,
  CASE 
    WHEN b.room_id BETWEEN 21 AND 35 THEN '정말 만족스러운 숙박이었습니다! 방이 깨끗하고 시설이 좋았어요. 다음에도 또 이용하고 싶습니다.'
    WHEN b.room_id BETWEEN 36 AND 45 THEN '스위트 룸의 인테리어가 정말 고급스러웠습니다. 거실과 침실이 분리되어 있어서 편리했어요.'
    WHEN b.room_id BETWEEN 46 AND 50 THEN '가족 여행에 딱 좋은 방이었습니다. 넓고 편안했어요. 다만 조금 시끄러웠던 점이 아쉽습니다.'
    WHEN b.room_id BETWEEN 51 AND 53 THEN '프리미엄 룸은 정말 최고입니다! 서비스도 훌륭하고 모든 것이 완벽했습니다.'
    ELSE '좋은 숙박 경험이었습니다.'
  END,
  NOW() - INTERVAL '1 day' * (5 + (ROW_NUMBER() OVER (ORDER BY b.id)))
FROM bookings b
WHERE b.status = 'COMPLETED'
ORDER BY b.id;

-- booking_id가 NULL인 리뷰 추가 (직접 작성한 리뷰)
-- 실제 존재하는 room_id를 참조하도록 서브쿼리 사용
INSERT INTO reviews (user_id, room_id, booking_id, rating, comment, created_at)
SELECT 
  'user05',
  (SELECT id FROM rooms WHERE type = '싱글' ORDER BY id LIMIT 1),
  NULL,
  4,
  '싱글 룸치고는 넓고 깔끔했습니다. 혼자 여행하기에 충분했어요.',
  NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM rooms WHERE type = '싱글');

INSERT INTO reviews (user_id, room_id, booking_id, rating, comment, created_at)
SELECT 
  'user01',
  (SELECT id FROM rooms WHERE type = '스위트' ORDER BY id LIMIT 1),
  NULL,
  5,
  '스위트 룸의 인테리어가 정말 고급스러웠습니다. 거실과 침실이 분리되어 있어서 편리했어요.',
  NOW() - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM rooms WHERE type = '스위트');

INSERT INTO reviews (user_id, room_id, booking_id, rating, comment, created_at)
SELECT 
  'user02',
  (SELECT id FROM rooms WHERE type = '프리미엄' ORDER BY id LIMIT 1),
  NULL,
  4,
  '프리미엄 룸은 가격 대비 만족도가 높았습니다. 발코니에서 보는 전망이 좋았어요.',
  NOW() - INTERVAL '6 days'
WHERE EXISTS (SELECT 1 FROM rooms WHERE type = '프리미엄');

INSERT INTO reviews (user_id, room_id, booking_id, rating, comment, created_at)
SELECT 
  'user03',
  (SELECT id FROM rooms WHERE type = '싱글' ORDER BY id LIMIT 1 OFFSET 4),
  NULL,
  3,
  '싱글 룸은 작업하기에 좋았지만, 조금 좁았던 것 같아요. 출장용으로는 괜찮습니다.',
  NOW() - INTERVAL '4 days'
WHERE EXISTS (SELECT 1 FROM rooms WHERE type = '싱글');
