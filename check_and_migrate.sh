#!/bin/bash

# 객실 상태 확인 및 마이그레이션 스크립트

echo "=== 객실 상태 확인 및 마이그레이션 ==="
echo ""

# 데이터베이스 연결 정보 (application.yml에서 가져옴)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="hoteldb"
DB_USER="sxxm"
DB_PASS="sxxmpass"

echo "1. 현재 객실 상태 확인..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT DISTINCT status, COUNT(*) as count 
FROM rooms 
GROUP BY status
ORDER BY status;
"

echo ""
echo "2. 이전 상태 값이 있는지 확인..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT id, name, status 
FROM rooms 
WHERE status IN ('AVAILABLE', 'CLEANING_NEEDED')
ORDER BY id;
"

echo ""
read -p "마이그레이션을 실행하시겠습니까? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "3. 마이그레이션 실행 중..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
UPDATE rooms 
SET status = 'CLEAN' 
WHERE status = 'AVAILABLE';

UPDATE rooms 
SET status = 'DIRTY' 
WHERE status = 'CLEANING_NEEDED';
EOF

    echo ""
    echo "4. 마이그레이션 후 상태 확인..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT DISTINCT status, COUNT(*) as count 
FROM rooms 
GROUP BY status
ORDER BY status;
"
    
    echo ""
    echo "✅ 마이그레이션 완료!"
else
    echo "마이그레이션이 취소되었습니다."
fi

