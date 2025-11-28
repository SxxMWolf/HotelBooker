// 메인 JavaScript 파일

document.addEventListener('DOMContentLoaded', function() {
    // 날짜 선택 시 체크아웃 날짜가 체크인 날짜보다 이전이 되지 않도록 설정
    const checkInInputs = document.querySelectorAll('input[name="checkInDate"], input[name="checkIn"]');
    const checkOutInputs = document.querySelectorAll('input[name="checkOutDate"], input[name="checkOut"]');
    
    checkInInputs.forEach(checkIn => {
        checkIn.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            checkOutInputs.forEach(checkOut => {
                checkOut.min = this.value;
                if (checkOut.value && new Date(checkOut.value) <= checkInDate) {
                    checkOut.value = '';
                }
            });
        });
    });
    
    // 체크아웃 날짜가 체크인 날짜보다 이전이 되지 않도록 설정
    checkOutInputs.forEach(checkOut => {
        checkOut.addEventListener('change', function() {
            checkInInputs.forEach(checkIn => {
                if (checkIn.value && new Date(this.value) <= new Date(checkIn.value)) {
                    alert('체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.');
                    this.value = '';
                }
            });
        });
    });
    
    // 오늘 날짜를 기본 최소 날짜로 설정
    const today = new Date().toISOString().split('T')[0];
    checkInInputs.forEach(input => {
        input.min = today;
    });
    checkOutInputs.forEach(input => {
        input.min = today;
    });
    
    // 알림 메시지 자동 숨김
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
    
    // 폼 제출 전 유효성 검사
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
});

// 숫자 포맷팅 함수
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

