#!/bin/bash
# PostgreSQL 연결 정보
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="hoteldb"
DB_USER="sxxm"

echo "=== 전체 예약 수 ==="
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as total_bookings FROM bookings;"

echo ""
echo "=== 상태별 예약 수 ==="
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT status, COUNT(*) as count FROM bookings GROUP BY status ORDER BY status;"

echo ""
echo "=== 현재 대시보드에서 카운트되는 예약 수 (CONFIRMED + 체크인 날짜 > 오늘) ==="
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as booked_count FROM bookings WHERE status = 'CONFIRMED' AND check_in_date > CURRENT_DATE;"

echo ""
echo "=== 오늘 날짜 ==="
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT CURRENT_DATE as today;"

echo ""
echo "=== 상세 예약 목록 (최근 10개) ==="
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, status, check_in_date, check_out_date, created_at FROM bookings ORDER BY created_at DESC LIMIT 10;"
