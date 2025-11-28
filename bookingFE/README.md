# Frontend (bookingFE)

이 폴더는 호텔 예약 시스템의 프론트엔드 리소스를 포함합니다.

## 구조

```
bookingFE/
├── templates/     # Thymeleaf 템플릿 파일
│   ├── admin/     # 관리자 화면
│   ├── customer/  # 고객 화면
│   └── ...
└── static/        # 정적 리소스
    ├── css/       # 스타일시트
    └── js/        # JavaScript 파일
```

## 템플릿 파일

- **index.html**: 메인 페이지
- **login.html**: 로그인 페이지
- **register.html**: 회원가입 페이지
- **customer/**: 고객용 화면 (객실 목록, 예약, 프로필 등)
- **admin/**: 관리자용 화면 (대시보드, 객실 관리, 예약 관리 등)

## 정적 리소스

- **css/style.css**: 전체 스타일시트
- **js/main.js**: 공통 JavaScript 기능

## 참고사항

이 폴더의 리소스는 Spring Boot 백엔드(bookingBE)에서 사용됩니다.
백엔드 애플리케이션은 이 폴더의 경로를 참조하여 템플릿과 정적 파일을 제공합니다.

