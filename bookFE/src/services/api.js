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
    // 디버깅을 위한 요청 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      });
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // 디버깅을 위한 에러 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        requestData: error.config?.data
      });
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
  getByType: (type) => api.get(`/rooms/type/${type}`),
  getByTypeAndViewType: (type, viewType) => api.get(`/rooms/type/${type}/view/${viewType}`),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

export const paymentAPI = {
  process: (data) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
  getByBookingId: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
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

export default api;

