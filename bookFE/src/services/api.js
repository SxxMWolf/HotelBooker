import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 localStorage는 유지
      // 로그인 API나 공개 API가 아닌 경우에만 로그인 페이지로 이동
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';
      
      // 공개 API나 로그인/회원가입 API는 리다이렉트하지 않음
      const isPublicAPI = requestUrl.includes('/auth/login') || 
                          requestUrl.includes('/auth/signup') ||
                          requestUrl.includes('/auth/forgot') ||
                          requestUrl.includes('/auth/verify') ||
                          requestUrl.includes('/rooms') ||
                          requestUrl.includes('/notices');
      
      // 이미 로그인/회원가입 페이지에 있으면 리다이렉트하지 않음
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      // 공개 API가 아니고 인증 페이지가 아니면 로그인 페이지로 이동
      // 단, 로그인/회원가입 API 자체의 401 에러는 무시 (잘못된 비밀번호 등)
      if (!isPublicAPI && !isAuthPage) {
        const token = localStorage.getItem('token');
        // 토큰이 있는데 401이면 만료된 것이므로 로그인 페이지로
        // 하지만 localStorage는 유지하여 사용자가 재로그인할 수 있도록 함
        if (token) {
          console.warn('토큰이 만료되었습니다. 다시 로그인해주세요.');
          // 토큰은 유지하고 로그인 페이지로 이동
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendVerificationCode: (email) => api.post('/auth/send-verification-code', { email }),
  verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  forgotId: (email) => api.post('/auth/forgot-id', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const roomAPI = {
  getAll: (checkInDate, checkOutDate) => {
    const params = {};
    if (checkInDate) params.checkInDate = checkInDate;
    if (checkOutDate) params.checkOutDate = checkOutDate;
    return api.get('/rooms', { params });
  },
  getById: (id) => api.get(`/rooms/${id}`),
  getByType: (type, checkInDate, checkOutDate) => {
    const params = {};
    if (checkInDate) params.checkInDate = checkInDate;
    if (checkOutDate) params.checkOutDate = checkOutDate;
    return api.get(`/rooms/type/${type}`, { params });
  },
  getByTypeAndViewType: (type, viewType, checkInDate, checkOutDate) => {
    const params = {};
    if (checkInDate) params.checkInDate = checkInDate;
    if (checkOutDate) params.checkOutDate = checkOutDate;
    return api.get(`/rooms/type/${type}/view/${viewType}`, { params });
  },
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getReviewable: () => api.get('/bookings/reviewable'),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

export const paymentAPI = {
  process: (data) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
  getByBookingId: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  getByRoomId: (roomId) => api.get(`/reviews/room/${roomId}`),
  getMyReviews: () => api.get('/reviews/my'),
};

export const noticeAPI = {
  getAll: () => api.get('/notices'),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  deleteAccount: () => api.delete('/users/me'),
};

export const adminAPI = {
  // 대시보드
  getDashboard: () => api.get('/admin/dashboard'),
  getTodayCheckIns: () => api.get('/admin/bookings/today-checkins'),
  getTodayCheckOuts: () => api.get('/admin/bookings/today-checkouts'),
  getCurrentStays: () => api.get('/admin/bookings/current-stays'),
  getMonthlyStats: (year, month) => api.get(`/admin/bookings/stats?year=${year}&month=${month}`),
  getRoomStatusSummary: () => api.get('/admin/rooms/status-summary'),
  getStatistics: (startYear, endYear) => api.get(`/admin/statistics?startYear=${startYear}&endYear=${endYear}`),
  
  // 객실 관리
  getAllRoomsAdmin: () => api.get('/admin/rooms'),
  getRoomByIdAdmin: (id) => api.get(`/admin/rooms/${id}`),
  createRoom: (data) => api.post('/admin/rooms', data),
  updateRoom: (id, data) => api.put(`/admin/rooms/${id}`, data),
  disableRoom: (id) => api.put(`/admin/rooms/${id}/disable`),
  enableRoom: (id) => api.put(`/admin/rooms/${id}/enable`),
  updateRoomStatus: (id, status) => api.put(`/admin/rooms/${id}/status`, { status }),
  
  // 예약 관리
  getAllBookingsAdmin: () => api.get('/admin/bookings'),
  getBookingByIdAdmin: (id) => api.get(`/admin/bookings/${id}`),
  updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}/status`, { status }),
  
  // 리뷰 관리
  getAllReviewsAdmin: () => api.get('/admin/reviews'),
  getReviewByIdAdmin: (id) => api.get(`/admin/reviews/${id}`),
  toggleReviewVisibility: (id) => api.put(`/admin/reviews/${id}/toggle-visibility`),
  createReviewReply: (id, data) => api.post(`/admin/reviews/${id}/reply`, data),
  updateReviewReply: (id, data) => api.put(`/admin/reviews/${id}/reply`, data),
  deleteReviewReply: (id) => api.delete(`/admin/reviews/${id}/reply`),
  
  // 공지사항 관리
  getAllNoticesAdmin: () => api.get('/admin/notices'),
  createNotice: (data) => api.post('/admin/notices', data),
  updateNotice: (id, data) => api.put(`/admin/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}`),
  toggleNoticeVisibility: (id) => api.put(`/admin/notices/${id}/toggle-visibility`),
};

export default api;

