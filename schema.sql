-- 호텔 예약 시스템 데이터베이스 스키마

-- 기존 테이블 삭제 (역순)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- 사용자 테이블
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'CUSTOMER' COMMENT 'CUSTOMER, ADMIN',
    social_provider VARCHAR(20) COMMENT 'GOOGLE, KAKAO, NAVER 등',
    social_id VARCHAR(100) COMMENT '소셜 로그인 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    enabled BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 객실 테이블
CREATE TABLE rooms (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    room_type VARCHAR(50) NOT NULL COMMENT 'STANDARD, DELUXE, SUITE 등',
    description TEXT,
    max_guests INT NOT NULL DEFAULT 2,
    price_per_night DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    amenities TEXT COMMENT '편의시설 (JSON 또는 쉼표 구분)',
    status VARCHAR(20) DEFAULT 'AVAILABLE' COMMENT 'AVAILABLE, BOOKED, MAINTENANCE, CLEANING',
    cleaning_needed BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 예약 테이블
CREATE TABLE bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_guests INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED',
    special_requests TEXT,
    cancellation_policy VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_check_in (check_in_date),
    INDEX idx_check_out (check_out_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 결제 테이블
CREATE TABLE payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL COMMENT 'CARD, SIMPLE_PAY 등',
    payment_status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, COMPLETED, FAILED, REFUNDED',
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_id VARCHAR(100),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 리뷰 테이블
CREATE TABLE reviews (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visible BOOLEAN DEFAULT TRUE,
    admin_reply TEXT,
    admin_reply_date TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_rating (rating),
    INDEX idx_visible (visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 공지사항/이벤트 테이블
CREATE TABLE notices (
    notice_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    notice_type VARCHAR(20) DEFAULT 'NOTICE' COMMENT 'NOTICE, EVENT, PROMOTION',
    image_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    visible BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_notice_type (notice_type),
    INDEX idx_visible (visible),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 관리자 기본 계정 (비밀번호: admin123 - BCrypt로 암호화 필요)
INSERT INTO users (username, password, email, name, role) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK7nKJ2', 'admin@hotel.com', '관리자', 'ADMIN');

-- 샘플 객실 데이터
INSERT INTO rooms (room_number, room_name, room_type, description, max_guests, price_per_night, amenities, status) VALUES
('101', '스탠다드 더블', 'STANDARD', '편안한 2인용 객실', 2, 100000, '와이파이,TV,에어컨,금고', 'AVAILABLE'),
('102', '스탠다드 트윈', 'STANDARD', '2개의 싱글 베드가 있는 객실', 2, 100000, '와이파이,TV,에어컨,금고', 'AVAILABLE'),
('201', '디럭스 더블', 'DELUXE', '넓은 공간의 디럭스 객실', 3, 150000, '와이파이,TV,에어컨,금고,미니바,욕조', 'AVAILABLE'),
('202', '디럭스 트윈', 'DELUXE', '넓은 공간의 디럭스 트윈', 3, 150000, '와이파이,TV,에어컨,금고,미니바,욕조', 'AVAILABLE'),
('301', '스위트', 'SUITE', '럭셔리 스위트 룸', 4, 250000, '와이파이,TV,에어컨,금고,미니바,욕조,발코니,라운지', 'AVAILABLE');

