import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, roomAPI, bookingAPI, reviewAPI, noticeAPI, userAPI } from '../services/api';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // 대시보드 데이터
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [todayCheckOuts, setTodayCheckOuts] = useState([]);
  const [currentStays, setCurrentStays] = useState([]);
  const [roomStatusSummary, setRoomStatusSummary] = useState(null);
  
  // 객실 관리
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    type: '',
    viewType: '',
    capacity: 2,
    bedCount: 1,
    pricePerNight: 0,
    description: '',
    imageUrl: '',
    status: 'AVAILABLE'
  });
  
  // 예약 관리
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all'); // 'all', 'CHECKED_IN', 'CONFIRMED', 'CHECKED_OUT', 'CANCELLED'
  
  // 리뷰 관리
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewDetail, setShowReviewDetail] = useState(false);
  const [reviewReplyForm, setReviewReplyForm] = useState({ content: '' });
  
  // 공지사항 관리
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    type: 'NOTICE',
    isPublic: true,
    startDate: '',
    endDate: ''
  });
  
  // 통계 관리
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsYearRange, setStatisticsYearRange] = useState({
    startYear: new Date().getFullYear() - 1,
    endYear: new Date().getFullYear()
  });

  // 대시보드 모달
  const [showRoomStatusModal, setShowRoomStatusModal] = useState(false);
  const [roomStatusFilter, setRoomStatusFilter] = useState(null);
  const [bookingListFilter, setBookingListFilter] = useState(null); // 'todayCheckIn', 'currentStays', 'todayCheckOut', 'booked'
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]); // 예약 목록
  
  // 프로필 관리
  const [profile, setProfile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Auth 로딩 중이면 아무것도 하지 않음 (localStorage에서 사용자 정보 복원 중)
    if (authLoading) {
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchDashboardData();
    fetchProfile();
  }, [user, navigate, activeTab, authLoading]);
  
  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data);
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'dashboard') {
        const [checkInsRes, checkOutsRes, summaryRes] = await Promise.all([
          adminAPI.getTodayCheckIns().catch(() => ({ data: [] })),
          adminAPI.getTodayCheckOuts().catch(() => ({ data: [] })),
          adminAPI.getRoomStatusSummary().catch(() => ({ data: null }))
        ]);
        
        // 현재 투숙 중 (CHECKED_IN 상태의 모든 예약)
        let currentStaysRes = { data: [] };
        try {
          currentStaysRes = await adminAPI.getCurrentStays();
        } catch (error) {
          console.error('현재 투숙 중 예약 로드 실패:', error);
          console.error('에러 응답:', error.response?.data);
          console.error('에러 메시지:', error.response?.data?.message || error.message);
          currentStaysRes = { data: [] };
        }
        setTodayCheckIns(checkInsRes.data || []);
        setTodayCheckOuts(checkOutsRes.data || []);
        setCurrentStays(currentStaysRes.data || []);
        setRoomStatusSummary(summaryRes.data);
      } else if (activeTab === 'rooms') {
        const [roomsRes, currentStaysRes] = await Promise.all([
          adminAPI.getAllRoomsAdmin().catch(() => roomAPI.getAll()),
          adminAPI.getCurrentStays().catch(() => ({ data: [] }))
        ]);
        // ID 오름차순으로 정렬
        const sortedRooms = (roomsRes.data || []).sort((a, b) => (a.id || 0) - (b.id || 0));
        // 각 객실에 현재 투숙 중인 예약 정보 추가
        const roomsWithBookings = sortedRooms.map(room => {
          const currentBooking = (currentStaysRes.data || []).find(
            booking => booking.roomId === room.id && booking.status === 'CHECKED_IN'
          );
          return {
            ...room,
            currentBooking: currentBooking || null
          };
        });
        setRooms(roomsWithBookings);
      } else if (activeTab === 'bookings') {
        const res = await adminAPI.getAllBookingsAdmin().catch(() => bookingAPI.getAll());
        setBookings(res.data || []);
      } else if (activeTab === 'reviews') {
        const res = await adminAPI.getAllReviewsAdmin().catch(() => ({ data: [] }));
        setReviews(res.data || []);
      } else if (activeTab === 'notices') {
        const res = await adminAPI.getAllNoticesAdmin().catch(() => noticeAPI.getAll());
        setNotices(res.data || []);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  const handleRoomSubmit = async () => {
    try {
      if (selectedRoom) {
        await adminAPI.updateRoom(selectedRoom.id, roomForm);
        alert('객실 정보가 수정되었습니다.');
      } else {
        await adminAPI.createRoom(roomForm);
        alert('객실이 추가되었습니다.');
      }
      setShowRoomForm(false);
      setSelectedRoom(null);
      setRoomForm({
        name: '',
        type: '',
        viewType: '',
        capacity: 2,
        bedCount: 1,
        pricePerNight: 0,
        description: '',
        imageUrl: '',
        status: 'AVAILABLE'
      });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || '객실 처리에 실패했습니다.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, status);
      alert('예약 상태가 변경되었습니다.');
      fetchDashboardData();
      setShowBookingDetail(false);
    } catch (error) {
      alert(error.response?.data?.message || '예약 상태 변경에 실패했습니다.');
    }
  };

  const handleToggleReviewVisibility = async (reviewId) => {
    try {
      await adminAPI.toggleReviewVisibility(reviewId);
      alert('리뷰 공개 상태가 변경되었습니다.');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || '리뷰 상태 변경에 실패했습니다.');
    }
  };

  const handleSubmitReviewReply = async (reviewId) => {
    try {
      if (selectedReview?.adminReply) {
        await adminAPI.updateReviewReply(reviewId, reviewReplyForm);
        alert('답변이 수정되었습니다.');
      } else {
        await adminAPI.createReviewReply(reviewId, reviewReplyForm);
        alert('답변이 작성되었습니다.');
      }
      setReviewReplyForm({ content: '' });
      fetchDashboardData();
      setShowReviewDetail(false);
    } catch (error) {
      alert(error.response?.data?.message || '답변 처리에 실패했습니다.');
    }
  };

  const handleNoticeSubmit = async () => {
    try {
      if (selectedNotice) {
        await adminAPI.updateNotice(selectedNotice.id, noticeForm);
        alert('공지사항이 수정되었습니다.');
      } else {
        await adminAPI.createNotice(noticeForm);
        alert('공지사항이 작성되었습니다.');
      }
      setShowNoticeForm(false);
      setSelectedNotice(null);
      setNoticeForm({
        title: '',
        content: '',
        type: 'NOTICE',
        isPublic: true,
        startDate: '',
        endDate: ''
      });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || '공지사항 처리에 실패했습니다.');
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await adminAPI.deleteNotice(noticeId);
      alert('공지사항이 삭제되었습니다.');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || '공지사항 삭제에 실패했습니다.');
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const response = await adminAPI.getStatistics(statisticsYearRange.startYear, statisticsYearRange.endYear);
      setStatistics(response.data);
    } catch (error) {
      console.error('통계 로드 실패:', error);
      alert('통계를 불러오는데 실패했습니다.');
    } finally {
      setStatisticsLoading(false);
    }
  };

  const handleRoomStatusClick = async (filterType) => {
    try {
      setRoomStatusFilter(filterType);
      const res = await adminAPI.getAllRoomsAdmin().catch(() => roomAPI.getAll());
      const allRooms = res.data || [];
      
      let filtered = [];
      
      if (filterType === 'booked') {
        // 예약 목록: 아직 체크인하지 않은 예약 (CONFIRMED 상태만)
        const bookingsRes = await adminAPI.getAllBookingsAdmin().catch(() => bookingAPI.getAll());
        const allBookings = bookingsRes.data || [];
        
        // CONFIRMED 상태이고 체크인 날짜가 오늘 또는 이후인 예약만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeBookings = allBookings.filter(booking => {
          if (booking.status !== 'CONFIRMED') return false;
          const checkInDate = new Date(booking.checkInDate);
          checkInDate.setHours(0, 0, 0, 0);
          return checkInDate >= today;
        }).sort((a, b) => {
          // 체크인 날짜가 빠른 순으로 정렬
          const aCheckIn = new Date(a.checkInDate);
          aCheckIn.setHours(0, 0, 0, 0);
          const bCheckIn = new Date(b.checkInDate);
          bCheckIn.setHours(0, 0, 0, 0);
          return aCheckIn - bCheckIn;
        });
        
        setConfirmedBookings(activeBookings);
        setBookingListFilter('booked');
        setShowRoomStatusModal(false);
        setTimeout(() => {
          document.getElementById('booking-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      } else if (filterType === 'available') {
        // 청소 완료 객실: status = CLEAN
        filtered = allRooms.filter(room => room.status === 'CLEAN');
      } else if (filterType === 'cleaning') {
        // 청소 필요 객실: status = DIRTY
        filtered = allRooms.filter(room => room.status === 'DIRTY');
      } else if (filterType === 'maintenance') {
        // 보수 중인 객실: status = MAINTENANCE
        filtered = allRooms.filter(room => room.status === 'MAINTENANCE');
      }
      
      setFilteredRooms(filtered);
      setShowRoomStatusModal(true);
    } catch (error) {
      alert('객실 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    try {
      await adminAPI.updateRoomStatus(roomId, newStatus);
      alert('객실 상태가 변경되었습니다.');
      handleRoomStatusClick(roomStatusFilter); // 목록 새로고침
      fetchDashboardData(); // 대시보드 데이터 새로고침
    } catch (error) {
      alert(error.response?.data?.message || '객실 상태 변경에 실패했습니다.');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    try {
      await userAPI.updateProfile({
        password: passwordForm.newPassword,
        currentPassword: passwordForm.currentPassword
      });
      alert('비밀번호가 변경되었습니다.');
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-hotel-cyan">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-pale-sky via-white to-hotel-pale-sky">
      <div className="bg-hotel-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">🏨 관리자 대시보드</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-hotel-teal text-white rounded-md hover:bg-hotel-cyan transition-colors"
              >
                비밀번호 변경
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-hotel-sky text-white rounded-md hover:bg-hotel-light-cyan transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-hotel-navy text-white shadow-lg'
                : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
            }`}
          >
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'rooms'
                ? 'bg-hotel-navy text-white shadow-lg'
                : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
            }`}
          >
            객실 관리
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'bookings'
                ? 'bg-hotel-navy text-white shadow-lg'
                : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
            }`}
          >
            예약 관리
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'reviews'
                ? 'bg-hotel-navy text-white shadow-lg'
                : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
            }`}
          >
            리뷰 관리
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'notices'
                ? 'bg-hotel-navy text-white shadow-lg'
                : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
            }`}
          >
            공지사항 관리
          </button>
          <button
            onClick={() => {
              setActiveTab('statistics');
              fetchStatistics();
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'statistics'
                ? 'bg-hotel-navy text-white shadow-lg'
                : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
            }`}
          >
            통계 분석
          </button>
        </div>

        {/* 대시보드 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roomStatusSummary && (
                <>
                  <div 
                    onClick={() => handleRoomStatusClick('booked')}
                    className="bg-white rounded-xl shadow-lg p-6 border border-hotel-pale cursor-pointer hover:bg-hotel-pale-sky transition-all"
                  >
                    <h3 className="text-sm font-medium text-hotel-cyan mb-2">예약</h3>
                    <p className="text-3xl font-bold text-hotel-teal">{roomStatusSummary.booked || 0}</p>
                    <p className="text-xs text-hotel-cyan mt-2">클릭하여 상세보기</p>
                  </div>
                  <div 
                    onClick={() => handleRoomStatusClick('available')}
                    className="bg-white rounded-xl shadow-lg p-6 border border-hotel-pale cursor-pointer hover:bg-hotel-pale-sky transition-all"
                  >
                    <h3 className="text-sm font-medium text-hotel-cyan mb-2">사용가능 객실</h3>
                    <p className="text-3xl font-bold text-hotel-teal">{roomStatusSummary.available || 0}</p>
                    <p className="text-xs text-hotel-cyan mt-2">클릭하여 상세보기</p>
                  </div>
                  <div 
                    onClick={() => handleRoomStatusClick('cleaning')}
                    className="bg-white rounded-xl shadow-lg p-6 border border-hotel-pale cursor-pointer hover:bg-hotel-pale-sky transition-all"
                  >
                    <h3 className="text-sm font-medium text-hotel-cyan mb-2">청소 필요</h3>
                    <p className="text-3xl font-bold text-yellow-600">{roomStatusSummary.cleaningNeeded || 0}</p>
                    <p className="text-xs text-hotel-cyan mt-2">클릭하여 상세보기</p>
                  </div>
                  <div 
                    onClick={() => handleRoomStatusClick('maintenance')}
                    className="bg-white rounded-xl shadow-lg p-6 border border-hotel-pale cursor-pointer hover:bg-hotel-pale-sky transition-all"
                  >
                    <h3 className="text-sm font-medium text-hotel-cyan mb-2">보수 중</h3>
                    <p className="text-3xl font-bold text-red-600">{roomStatusSummary.maintenance || 0}</p>
                    <p className="text-xs text-hotel-cyan mt-2">클릭하여 상세보기</p>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => {
                  setBookingListFilter('todayCheckIn');
                  setTimeout(() => {
                    document.getElementById('booking-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="bg-white rounded-xl shadow-lg p-6 border border-hotel-pale cursor-pointer hover:bg-hotel-pale-sky transition-all"
              >
                <h3 className="text-sm font-medium text-hotel-cyan mb-2">오늘 체크인</h3>
                <p className="text-3xl font-bold text-hotel-teal">{todayCheckIns.length}</p>
                <p className="text-xs text-hotel-cyan mt-2">클릭하여 상세보기</p>
              </div>

              <div 
                onClick={() => {
                  setBookingListFilter('currentStays');
                  setTimeout(() => {
                    document.getElementById('booking-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="bg-white rounded-xl shadow-lg p-6 border border-hotel-pale cursor-pointer hover:bg-hotel-pale-sky transition-all"
              >
                <h3 className="text-sm font-medium text-hotel-cyan mb-2">현재 투숙 중</h3>
                <p className="text-3xl font-bold text-hotel-teal">{currentStays.length}</p>
                <p className="text-xs text-hotel-cyan mt-2">클릭하여 상세보기</p>
              </div>

              <div 
                onClick={() => {
                  setBookingListFilter('todayCheckOut');
                  setTimeout(() => {
                    document.getElementById('booking-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="bg-white rounded-xl shadow-lg p-6 border border-hotel-pale cursor-pointer hover:bg-hotel-pale-sky transition-all"
              >
                <h3 className="text-sm font-medium text-hotel-cyan mb-2">오늘 체크아웃</h3>
                <p className="text-3xl font-bold text-hotel-teal">{todayCheckOuts.length}</p>
                <p className="text-xs text-hotel-cyan mt-2">클릭하여 상세보기</p>
              </div>
            </div>

            {/* 예약 목록 섹션 */}
            {bookingListFilter && (
              <div id="booking-list-section" className="bg-white rounded-2xl shadow-lg p-6 border border-hotel-pale">
                <h2 className="text-2xl font-semibold text-hotel-dark mb-4">
                  {bookingListFilter === 'todayCheckIn' && '오늘 체크인 예약'}
                  {bookingListFilter === 'currentStays' && '현재 투숙 중 예약'}
                  {bookingListFilter === 'todayCheckOut' && '오늘 체크아웃 예약'}
                  {bookingListFilter === 'booked' && '예약'}
                </h2>
                <div className="max-h-96 overflow-y-auto">
                  {(() => {
                    let bookingsToShow = [];
                    if (bookingListFilter === 'todayCheckIn') {
                      bookingsToShow = todayCheckIns;
                    } else if (bookingListFilter === 'currentStays') {
                      bookingsToShow = currentStays;
                    } else if (bookingListFilter === 'todayCheckOut') {
                      bookingsToShow = todayCheckOuts;
                    } else if (bookingListFilter === 'booked') {
                      bookingsToShow = confirmedBookings;
                    }

                    if (bookingsToShow.length === 0) {
                      return (
                        <p className="text-hotel-cyan text-center py-4">
                          {bookingListFilter === 'todayCheckIn' && '체크인 예정이 없습니다.'}
                          {bookingListFilter === 'currentStays' && '투숙 중인 예약이 없습니다.'}
                          {bookingListFilter === 'todayCheckOut' && '체크아웃 예정이 없습니다.'}
                          {bookingListFilter === 'booked' && '예약이 없습니다.'}
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {bookingsToShow.map((booking) => (
                          <div 
                            key={booking.id} 
                            className="border border-hotel-pale rounded-lg p-4 cursor-pointer hover:bg-hotel-pale-sky transition-all"
                            onClick={async () => {
                              try {
                                const res = await adminAPI.getBookingByIdAdmin(booking.id).catch(() => bookingAPI.getById(booking.id));
                                setSelectedBooking(res.data);
                                setShowBookingDetail(true);
                              } catch (error) {
                                alert('예약 상세 정보를 불러오는데 실패했습니다.');
                              }
                            }}
                          >
                            <p className="font-semibold text-hotel-dark">{booking.roomName}</p>
                            <p className="text-sm text-hotel-cyan">예약자: {booking.userName || 'N/A'}</p>
                            {bookingListFilter === 'todayCheckIn' && (
                              <p className="text-sm text-hotel-cyan">체크인: {new Date(booking.checkInDate).toLocaleString('ko-KR')}</p>
                            )}
                            {bookingListFilter === 'currentStays' && (
                              <>
                                <p className="text-sm text-hotel-cyan">체크인: {new Date(booking.checkInDate).toLocaleString('ko-KR')}</p>
                                <p className="text-sm text-hotel-cyan">체크아웃: {new Date(booking.checkOutDate).toLocaleString('ko-KR')}</p>
                                <p className="text-xs text-blue-600 mt-1 font-medium">✓ 체크인 완료</p>
                              </>
                            )}
                            {bookingListFilter === 'todayCheckOut' && (
                              <p className="text-sm text-hotel-cyan">체크아웃: {new Date(booking.checkOutDate).toLocaleString('ko-KR')}</p>
                            )}
                            {bookingListFilter === 'booked' && (
                              <>
                                <p className="text-sm text-hotel-cyan">체크인: {new Date(booking.checkInDate).toLocaleDateString('ko-KR')}</p>
                                <p className="text-sm text-hotel-cyan">체크아웃: {new Date(booking.checkOutDate).toLocaleDateString('ko-KR')}</p>
                                <p className="text-sm text-hotel-cyan">인원: {booking.guests}명</p>
                                {new Date(booking.checkInDate).toDateString() === new Date().toDateString() && (
                                  <p className="text-xs text-orange-600 mt-1 font-medium">⚠ 오늘 체크인</p>
                                )}
                              </>
                            )}
                            <p className="text-xs text-hotel-cyan mt-1">클릭하여 상세보기</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 객실 관리 */}
        {activeTab === 'rooms' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold text-hotel-dark">객실 관리</h2>
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setRoomForm({
                    name: '',
                    type: '',
                    viewType: '',
                    capacity: 2,
                    bedCount: 1,
                    pricePerNight: 0,
                    description: '',
                    imageUrl: '',
                    status: 'AVAILABLE'
                  });
                  setShowRoomForm(true);
                }}
                className="px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                객실 추가
              </button>
            </div>
            {loading ? (
              <div className="text-center text-hotel-cyan py-8">로딩 중...</div>
            ) : rooms.length === 0 ? (
              <p className="text-hotel-cyan text-center py-8">등록된 객실이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 모든 객실 (ID 오름차순) */}
                {rooms.map((room) => (
                    <div 
                      key={room.id} 
                      className={`border border-hotel-pale rounded-xl p-4 transition-all ${
                        room.available 
                          ? 'hover:bg-hotel-pale-sky' 
                          : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      {room.imageUrl && (
                        <img 
                          src={room.imageUrl} 
                          alt={room.name} 
                          className={`w-full h-48 object-cover rounded-lg mb-3 ${
                            !room.available ? 'grayscale' : ''
                          }`} 
                        />
                      )}
                      <h3 className="text-xl font-semibold text-hotel-dark mb-2">
                        {room.name} {!room.available && <span className="text-xs text-gray-500">(비활성화)</span>}
                      </h3>
                      <p className="text-sm text-hotel-cyan mb-2">{room.type} · {room.viewType || 'N/A'}</p>
                      <p className="text-sm text-hotel-cyan mb-2">수용인원: {room.capacity}명</p>
                      <p className="text-lg font-semibold text-hotel-teal mb-2">₩{room.pricePerNight?.toLocaleString()}/박</p>
                      
                      {/* 사용 중인 경우 투숙자 정보 표시 */}
                      {room.currentBooking && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-blue-800 mb-1">🛏️ 사용 중</p>
                          <p className="text-xs text-blue-700">투숙자: {room.currentBooking.userName || 'N/A'}</p>
                          <p className="text-xs text-blue-700">체크인: {new Date(room.currentBooking.checkInDate).toLocaleDateString('ko-KR')}</p>
                          <p className="text-xs text-blue-700">체크아웃: {new Date(room.currentBooking.checkOutDate).toLocaleDateString('ko-KR')}</p>
                        </div>
                      )}
                      
                      {/* 사용 중이 아닐 때만 상태 태그 표시 */}
                      {!room.currentBooking && (
                        <p className={`text-xs px-2 py-1 rounded-full inline-block mb-3 ${
                          !room.available ? 'bg-gray-200 text-gray-600' :
                          room.status === 'CLEAN' ? 'bg-green-100 text-green-800' :
                          room.status === 'DIRTY' ? 'bg-yellow-100 text-yellow-800' :
                          room.status === 'MAINTENANCE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {!room.available ? '비활성화됨' :
                           room.status === 'CLEAN' ? '청소 완료' :
                           room.status === 'DIRTY' ? '청소 필요' :
                           room.status === 'MAINTENANCE' ? '보수 중' :
                           '알 수 없음'}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setRoomForm({
                              name: room.name,
                              type: room.type,
                              viewType: room.viewType || '',
                              capacity: room.capacity,
                              bedCount: room.bedCount || 1,
                              pricePerNight: room.pricePerNight,
                              description: room.description || '',
                              imageUrl: room.imageUrl || '',
                              status: room.status || 'AVAILABLE'
                            });
                            setShowRoomForm(true);
                          }}
                          className="flex-1 px-3 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal text-sm font-semibold transition-all"
                        >
                          수정
                        </button>
                        <button
                          onClick={async () => {
                            if (room.available) {
                              if (confirm('객실을 비활성화하시겠습니까?')) {
                                try {
                                  await adminAPI.disableRoom(room.id);
                                  alert('객실이 비활성화되었습니다.');
                                  fetchDashboardData();
                                } catch (error) {
                                  alert(error.response?.data?.message || '객실 비활성화에 실패했습니다.');
                                }
                              }
                            } else {
                              if (confirm('객실을 활성화하시겠습니까?')) {
                                try {
                                  await adminAPI.enableRoom(room.id);
                                  alert('객실이 활성화되었습니다.');
                                  fetchDashboardData();
                                } catch (error) {
                                  alert(error.response?.data?.message || '객실 활성화에 실패했습니다.');
                                }
                              }
                            }
                          }}
                          className={`flex-1 px-3 py-2 text-white rounded-lg text-sm font-semibold transition-all ${
                            room.available
                              ? 'bg-gray-500 hover:bg-gray-600'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {room.available ? '비활성화' : '활성화'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 예약 관리 */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold text-hotel-dark">예약 관리</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setBookingStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    bookingStatusFilter === 'all'
                      ? 'bg-hotel-navy text-white shadow-lg'
                      : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setBookingStatusFilter('todayCheckIn')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    bookingStatusFilter === 'todayCheckIn'
                      ? 'bg-hotel-navy text-white shadow-lg'
                      : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
                  }`}
                >
                  오늘 체크인
                </button>
                <button
                  onClick={() => setBookingStatusFilter('CHECKED_IN')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    bookingStatusFilter === 'CHECKED_IN'
                      ? 'bg-hotel-navy text-white shadow-lg'
                      : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
                  }`}
                >
                  현재 투숙 중
                </button>
                <button
                  onClick={() => setBookingStatusFilter('todayCheckOut')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    bookingStatusFilter === 'todayCheckOut'
                      ? 'bg-hotel-navy text-white shadow-lg'
                      : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
                  }`}
                >
                  오늘 체크아웃
                </button>
                <button
                  onClick={() => setBookingStatusFilter('CANCELLED')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    bookingStatusFilter === 'CANCELLED'
                      ? 'bg-hotel-navy text-white shadow-lg'
                      : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
                  }`}
                >
                  취소됨
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center text-hotel-cyan py-8">로딩 중...</div>
            ) : bookings.length === 0 ? (
              <p className="text-hotel-cyan text-center py-8">예약 내역이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {[...bookings]
                  .filter(booking => {
                    if (bookingStatusFilter === 'all') return true;
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkInDate = new Date(booking.checkInDate);
                    const checkOutDate = new Date(booking.checkOutDate);
                    checkInDate.setHours(0, 0, 0, 0);
                    checkOutDate.setHours(0, 0, 0, 0);
                    
                    if (bookingStatusFilter === 'todayCheckIn') {
                      return booking.status === 'CONFIRMED' && checkInDate.getTime() === today.getTime();
                    }
                    if (bookingStatusFilter === 'todayCheckOut') {
                      return booking.status === 'CHECKED_IN' && checkOutDate.getTime() === today.getTime();
                    }
                    if (bookingStatusFilter === 'CHECKED_IN') {
                      return booking.status === 'CHECKED_IN';
                    }
                    if (bookingStatusFilter === 'CHECKED_OUT') {
                      return booking.status === 'CHECKED_OUT';
                    }
                    if (bookingStatusFilter === 'CANCELLED') {
                      return booking.status === 'CANCELLED';
                    }
                    
                    return booking.status === bookingStatusFilter;
                  })
                  .sort((a, b) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const aCheckIn = new Date(a.checkInDate);
                    const bCheckIn = new Date(b.checkInDate);
                    const aCheckOut = new Date(a.checkOutDate);
                    const bCheckOut = new Date(b.checkOutDate);
                    aCheckIn.setHours(0, 0, 0, 0);
                    bCheckIn.setHours(0, 0, 0, 0);
                    aCheckOut.setHours(0, 0, 0, 0);
                    bCheckOut.setHours(0, 0, 0, 0);
                    
                    // 1. 오늘 체크인 (CONFIRMED & checkInDate === 오늘)
                    const aIsTodayCheckIn = a.status === 'CONFIRMED' && aCheckIn.getTime() === today.getTime();
                    const bIsTodayCheckIn = b.status === 'CONFIRMED' && bCheckIn.getTime() === today.getTime();
                    if (aIsTodayCheckIn !== bIsTodayCheckIn) {
                      return aIsTodayCheckIn ? -1 : 1;
                    }
                    
                    // 2. 현재 투숙 중 (CHECKED_IN)
                    const aIsCheckedIn = a.status === 'CHECKED_IN';
                    const bIsCheckedIn = b.status === 'CHECKED_IN';
                    if (aIsCheckedIn !== bIsCheckedIn) {
                      return aIsCheckedIn ? -1 : 1;
                    }
                    
                    // 3. 오늘 체크아웃 예정 (CHECKED_IN & checkOutDate === 오늘)
                    const aIsTodayCheckOut = a.status === 'CHECKED_IN' && aCheckOut.getTime() === today.getTime();
                    const bIsTodayCheckOut = b.status === 'CHECKED_IN' && bCheckOut.getTime() === today.getTime();
                    if (aIsTodayCheckOut !== bIsTodayCheckOut) {
                      return aIsTodayCheckOut ? -1 : 1;
                    }
                    
                    // 4. 과거 체크아웃한 예약 (CHECKED_OUT)
                    const aIsCheckedOut = a.status === 'CHECKED_OUT';
                    const bIsCheckedOut = b.status === 'CHECKED_OUT';
                    if (aIsCheckedOut !== bIsCheckedOut) {
                      return aIsCheckedOut ? -1 : 1;
                    }
                    
                    // 5. 취소된 예약 (CANCELLED)
                    const aIsCancelled = a.status === 'CANCELLED';
                    const bIsCancelled = b.status === 'CANCELLED';
                    if (aIsCancelled !== bIsCancelled) {
                      return aIsCancelled ? -1 : 1;
                    }
                    
                    // 같은 카테고리 내에서는 날짜 순으로 정렬
                    if (aIsTodayCheckIn || aIsCheckedIn) {
                      // 체크인/투숙 중: 체크아웃 날짜 빠른 순
                      return aCheckOut - bCheckOut;
                    } else if (aIsCheckedOut) {
                      // 체크아웃: 체크아웃 날짜 오래된 순
                      return bCheckOut - aCheckOut;
                    } else {
                      // 기타: 체크인 날짜 빠른 순
                      return aCheckIn - bCheckIn;
                    }
                  })
                  .map((booking) => {
                    const isRefunded = booking.status === 'CANCELLED' && 
                                      booking.payment && 
                                      booking.payment.status === 'REFUNDED';
                    const shouldBeDimmed = isRefunded;
                    return (
                  <div 
                    key={booking.id} 
                    className={`border border-hotel-pale rounded-xl p-6 transition-all ${
                      shouldBeDimmed 
                        ? 'opacity-50 hover:opacity-70' 
                        : 'hover:bg-hotel-pale-sky'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-hotel-dark mb-2">{booking.roomName}</h3>
                        <p className="text-hotel-cyan mb-1">예약자: {booking.userName || 'N/A'}</p>
                        <p className="text-hotel-cyan mb-1">
                          {new Date(booking.checkInDate).toLocaleDateString('ko-KR')} ~ {new Date(booking.checkOutDate).toLocaleDateString('ko-KR')}
                        </p>
                        <p className="text-hotel-cyan mb-2">인원: {booking.guests}명</p>
                        <p className="text-xl font-semibold text-hotel-teal mb-2">₩{booking.totalPrice.toLocaleString()}</p>
                        <p className={`text-sm font-medium ${
                          booking.status === 'CONFIRMED' ? 'text-green-600' :
                          booking.status === 'CANCELLED' ? 'text-red-600' :
                          booking.status === 'CHECKED_IN' ? 'text-blue-600' :
                          booking.status === 'CHECKED_OUT' ? 'text-gray-600' :
                          'text-gray-600'
                        }`}>
                          상태: {booking.status === 'CONFIRMED' ? '승인됨' :
                                booking.status === 'CANCELLED' ? '취소됨' :
                                booking.status === 'CHECKED_IN' ? '체크인' :
                                booking.status === 'CHECKED_OUT' ? '체크아웃' :
                                '알 수 없음'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const res = await adminAPI.getBookingByIdAdmin(booking.id).catch(() => bookingAPI.getById(booking.id));
                              setSelectedBooking(res.data);
                              setShowBookingDetail(true);
                            } catch (error) {
                              alert('예약 상세 정보를 불러오는데 실패했습니다.');
                            }
                          }}
                          className="px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                        >
                          상세보기
                        </button>
                      </div>
                    </div>
                  </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* 리뷰 관리 */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
            <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">리뷰 관리</h2>
            {loading ? (
              <div className="text-center text-hotel-cyan py-8">로딩 중...</div>
            ) : reviews.length === 0 ? (
              <p className="text-hotel-cyan text-center py-8">리뷰가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-hotel-teal text-lg">⭐ {review.rating}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            review.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {review.isPublic ? '공개' : '비공개'}
                          </span>
                        </div>
                        <p className="text-hotel-dark mb-2">{review.comment || '내용 없음'}</p>
                        <p className="text-sm text-hotel-cyan text-left">작성자: {review.userName || 'N/A'}</p>
                        <p className="text-sm text-hotel-cyan text-left">작성일: {new Date(review.createdAt).toLocaleDateString('ko-KR')}</p>
                        {review.adminReply && (
                          <div className="mt-3 p-3 bg-hotel-pale-sky rounded-lg">
                            <p className="text-sm font-semibold text-hotel-navy mb-1">관리자 답변:</p>
                            <p className="text-sm text-hotel-dark">{review.adminReply}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setReviewReplyForm({ content: review.adminReply || '' });
                            setShowReviewDetail(true);
                          }}
                          className="px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                        >
                          상세보기
                        </button>
                        <button
                          onClick={() => handleToggleReviewVisibility(review.id)}
                          className="px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                        >
                          {review.isPublic ? '비공개' : '공개'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 공지사항 관리 */}
        {activeTab === 'notices' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold text-hotel-dark">공지사항 관리</h2>
              <button
                onClick={() => {
                  setSelectedNotice(null);
                  setNoticeForm({
                    title: '',
                    content: '',
                    type: 'NOTICE',
                    isPublic: true,
                    startDate: '',
                    endDate: ''
                  });
                  setShowNoticeForm(true);
                }}
                className="px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                공지 작성
              </button>
            </div>
            {loading ? (
              <div className="text-center text-hotel-cyan py-8">로딩 중...</div>
            ) : notices.length === 0 ? (
              <p className="text-hotel-cyan text-center py-8">공지사항이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-hotel-dark">{notice.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notice.type === 'EVENT' ? 'bg-purple-100 text-purple-800' :
                            notice.type === 'PROMOTION' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notice.type === 'EVENT' ? '이벤트' :
                             notice.type === 'PROMOTION' ? '프로모션' : '공지'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notice.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notice.isPublic ? '공개' : '비공개'}
                          </span>
                        </div>
                        <p className="text-hotel-cyan mb-2">{notice.content}</p>
                        {notice.startDate && notice.endDate && (
                          <p className="text-sm text-hotel-cyan">
                            기간: {new Date(notice.startDate).toLocaleDateString('ko-KR')} ~ {new Date(notice.endDate).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row gap-2">
                        <button
                          onClick={() => {
                            setSelectedNotice(notice);
                            setNoticeForm({
                              title: notice.title,
                              content: notice.content,
                              type: notice.type,
                              isPublic: notice.isPublic,
                              startDate: notice.startDate ? new Date(notice.startDate).toISOString().split('T')[0] : '',
                              endDate: notice.endDate ? new Date(notice.endDate).toISOString().split('T')[0] : ''
                            });
                            setShowNoticeForm(true);
                          }}
                          className="px-4 py-2 w-20 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="px-4 py-2 w-20 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-semibold transition-all"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 객실 추가/수정 모달 */}
        {showRoomForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-hotel-dark">
                {selectedRoom ? '객실 수정' : '객실 추가'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">객실명</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">객실 타입</label>
                  <input
                    type="text"
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">전망</label>
                  <input
                    type="text"
                    value={roomForm.viewType}
                    onChange={(e) => setRoomForm({ ...roomForm, viewType: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-hotel-dark mb-2">수용인원</label>
                    <input
                      type="number"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-hotel-dark mb-2">침대 수</label>
                    <input
                      type="number"
                      value={roomForm.bedCount}
                      onChange={(e) => setRoomForm({ ...roomForm, bedCount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">1박 가격</label>
                  <input
                    type="number"
                    value={roomForm.pricePerNight}
                    onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">설명</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">이미지 URL</label>
                  <input
                    type="text"
                    value={roomForm.imageUrl}
                    onChange={(e) => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">상태</label>
                  <select
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  >
                    <option value="AVAILABLE">사용 가능</option>
                    <option value="CLEANING_NEEDED">청소 필요</option>
                    <option value="MAINTENANCE">보수 중</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleRoomSubmit}
                  className="flex-1 px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                >
                  {selectedRoom ? '수정' : '추가'}
                </button>
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 예약 상세 모달 */}
        {showBookingDetail && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-hotel-dark">예약 상세 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">객실명</label>
                  <p className="text-hotel-cyan">{selectedBooking.roomName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">예약자</label>
                  <p className="text-hotel-cyan">{selectedBooking.userName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">체크인 / 체크아웃</label>
                  <p className="text-hotel-cyan">
                    {new Date(selectedBooking.checkInDate).toLocaleDateString('ko-KR')} ~ {new Date(selectedBooking.checkOutDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">인원</label>
                  <p className="text-hotel-cyan">{selectedBooking.guests}명</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">총 금액</label>
                  <p className="text-hotel-cyan text-lg font-semibold">₩{selectedBooking.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">상태</label>
                  <p className={`text-sm font-medium ${
                    selectedBooking.status === 'CONFIRMED' ? 'text-green-600' :
                    selectedBooking.status === 'CANCELLED' ? 'text-red-600' :
                    selectedBooking.status === 'CHECKED_IN' ? 'text-blue-600' :
                    selectedBooking.status === 'CHECKED_OUT' ? 'text-gray-600' :
                    'text-gray-600'
                  }`}>
                    {selectedBooking.status === 'CONFIRMED' ? '승인됨' :
                     selectedBooking.status === 'CANCELLED' ? '취소됨' :
                     selectedBooking.status === 'CHECKED_IN' ? '체크인' :
                     selectedBooking.status === 'CHECKED_OUT' ? '체크아웃' :
                     '알 수 없음'}
                  </p>
                </div>
                {selectedBooking.specialRequests && (
                  <div>
                    <label className="block text-sm font-medium text-hotel-dark mb-2">고객 요청사항</label>
                    <p className="text-hotel-cyan">{selectedBooking.specialRequests}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-2">
                {selectedBooking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'CHECKED_IN')}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-all"
                  >
                    체크인 처리
                  </button>
                )}
                {selectedBooking.status === 'CHECKED_IN' && (() => {
                  const checkOutDate = new Date(selectedBooking.checkOutDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  checkOutDate.setHours(0, 0, 0, 0);
                  // 체크아웃 날짜가 오늘 이후인 경우에만 버튼 표시
                  return checkOutDate.getTime() >= today.getTime() ? (
                    <button
                      onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'CHECKED_OUT')}
                      className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-all"
                    >
                      체크아웃 처리
                    </button>
                  ) : null;
                })()}
                <button
                  onClick={() => {
                    setShowBookingDetail(false);
                    setSelectedBooking(null);
                  }}
                  className="w-full px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 리뷰 상세 모달 */}
        {showReviewDetail && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-hotel-dark">리뷰 상세 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">평점</label>
                  <p className="text-hotel-teal text-lg font-semibold">⭐ {selectedReview.rating}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">내용</label>
                  <p className="text-hotel-cyan">{selectedReview.comment || '내용 없음'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">작성자</label>
                  <p className="text-hotel-cyan">{selectedReview.userName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">작성일</label>
                  <p className="text-hotel-cyan">{new Date(selectedReview.createdAt).toLocaleString('ko-KR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">공개 상태</label>
                  <p className={`text-sm font-medium ${selectedReview.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedReview.isPublic ? '공개' : '비공개'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">관리자 답변</label>
                  <textarea
                    value={reviewReplyForm.content}
                    onChange={(e) => setReviewReplyForm({ content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    placeholder="관리자 답변을 작성하세요..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleSubmitReviewReply(selectedReview.id)}
                  className="flex-1 px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                >
                  {selectedReview.adminReply ? '답변 수정' : '답변 작성'}
                </button>
                {selectedReview.adminReply && (
                  <button
                    onClick={async () => {
                      if (confirm('답변을 삭제하시겠습니까?')) {
                        try {
                          await adminAPI.deleteReviewReply(selectedReview.id);
                          alert('답변이 삭제되었습니다.');
                          fetchDashboardData();
                          setShowReviewDetail(false);
                        } catch (error) {
                          alert(error.response?.data?.message || '답변 삭제에 실패했습니다.');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-all"
                  >
                    답변 삭제
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowReviewDetail(false);
                    setSelectedReview(null);
                    setReviewReplyForm({ content: '' });
                  }}
                  className="px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 공지사항 작성/수정 모달 */}
        {showNoticeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-hotel-dark">
                {selectedNotice ? '공지사항 수정' : '공지사항 작성'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">제목</label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">내용</label>
                  <textarea
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">유형</label>
                  <select
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                  >
                    <option value="NOTICE">공지</option>
                    <option value="EVENT">이벤트</option>
                    <option value="PROMOTION">프로모션</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">
                    <input
                      type="checkbox"
                      checked={noticeForm.isPublic}
                      onChange={(e) => setNoticeForm({ ...noticeForm, isPublic: e.target.checked })}
                      className="mr-2"
                    />
                    공개
                  </label>
                </div>
                {(noticeForm.type === 'EVENT' || noticeForm.type === 'PROMOTION') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-hotel-dark mb-2">시작일</label>
                      <input
                        type="date"
                        value={noticeForm.startDate}
                        onChange={(e) => setNoticeForm({ ...noticeForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-hotel-dark mb-2">종료일</label>
                      <input
                        type="date"
                        value={noticeForm.endDate}
                        onChange={(e) => setNoticeForm({ ...noticeForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleNoticeSubmit}
                  className="flex-1 px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                >
                  {selectedNotice ? '수정' : '작성'}
                </button>
                <button
                  onClick={() => {
                    setShowNoticeForm(false);
                    setSelectedNotice(null);
                  }}
                  className="flex-1 px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 비밀번호 변경 모달 */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-hotel-pale shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-hotel-dark">비밀번호 변경</h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="text-hotel-cyan hover:text-hotel-teal text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                >
                  변경
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 통계 분석 */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-hotel-pale">
              <h2 className="text-2xl font-semibold text-hotel-dark mb-4">통계 분석</h2>
              
              {/* 연도 범위 선택 */}
              <div className="mb-6 flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">시작 연도</label>
                  <input
                    type="number"
                    value={statisticsYearRange.startYear}
                    onChange={(e) => setStatisticsYearRange({
                      ...statisticsYearRange,
                      startYear: parseInt(e.target.value) || new Date().getFullYear() - 1
                    })}
                    className="px-4 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    min="2020"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">종료 연도</label>
                  <input
                    type="number"
                    value={statisticsYearRange.endYear}
                    onChange={(e) => setStatisticsYearRange({
                      ...statisticsYearRange,
                      endYear: parseInt(e.target.value) || new Date().getFullYear()
                    })}
                    className="px-4 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky"
                    min="2020"
                    max={new Date().getFullYear()}
                  />
                </div>
                <button
                  onClick={fetchStatistics}
                  disabled={statisticsLoading}
                  className="px-6 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all disabled:opacity-50"
                >
                  {statisticsLoading ? '로딩 중...' : '조회'}
                </button>
              </div>

              {statisticsLoading ? (
                <div className="text-center text-hotel-cyan py-8">통계를 불러오는 중...</div>
              ) : statistics ? (
                <div className="space-y-8">
                  {/* 년도별 통계 */}
                  {statistics.yearlyStatistics && statistics.yearlyStatistics.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-hotel-dark mb-4">년도별 통계</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-hotel-pale-sky">
                              <th className="border border-hotel-pale px-4 py-3 text-left text-sm font-semibold text-hotel-dark">연도</th>
                              <th className="border border-hotel-pale px-4 py-3 text-right text-sm font-semibold text-hotel-dark">총 예약 수</th>
                              <th className="border border-hotel-pale px-4 py-3 text-right text-sm font-semibold text-hotel-dark">총 매출</th>
                              <th className="border border-hotel-pale px-4 py-3 text-right text-sm font-semibold text-hotel-dark">평균 예약 금액</th>
                              <th className="border border-hotel-pale px-4 py-3 text-right text-sm font-semibold text-hotel-dark">월평균 매출</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statistics.yearlyStatistics.map((yearStat) => (
                              <tr key={yearStat.year} className="hover:bg-hotel-pale-sky transition-colors">
                                <td className="border border-hotel-pale px-4 py-3 font-semibold text-hotel-dark">{yearStat.year}년</td>
                                <td className="border border-hotel-pale px-4 py-3 text-right text-hotel-cyan">{yearStat.totalBookings?.toLocaleString() || 0}</td>
                                <td className="border border-hotel-pale px-4 py-3 text-right text-hotel-teal font-semibold">₩{parseFloat(yearStat.totalRevenue || 0).toLocaleString()}</td>
                                <td className="border border-hotel-pale px-4 py-3 text-right text-hotel-cyan">₩{parseFloat(yearStat.averageBookingAmount || 0).toLocaleString()}</td>
                                <td className="border border-hotel-pale px-4 py-3 text-right text-hotel-teal font-semibold">₩{parseFloat(yearStat.averageMonthlyRevenue || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 월별 통계 */}
                  {statistics.monthlyStatistics && statistics.monthlyStatistics.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-hotel-dark mb-4">월별 통계</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-hotel-pale-sky">
                              <th className="border border-hotel-pale px-4 py-3 text-left text-sm font-semibold text-hotel-dark">연도</th>
                              <th className="border border-hotel-pale px-4 py-3 text-left text-sm font-semibold text-hotel-dark">월</th>
                              <th className="border border-hotel-pale px-4 py-3 text-right text-sm font-semibold text-hotel-dark">예약 수</th>
                              <th className="border border-hotel-pale px-4 py-3 text-right text-sm font-semibold text-hotel-dark">총 매출</th>
                              <th className="border border-hotel-pale px-4 py-3 text-right text-sm font-semibold text-hotel-dark">평균 예약 금액</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statistics.monthlyStatistics
                              .sort((a, b) => {
                                if (a.year !== b.year) return b.year - a.year;
                                return b.month - a.month;
                              })
                              .map((monthStat) => (
                                <tr key={`${monthStat.year}-${monthStat.month}`} className="hover:bg-hotel-pale-sky transition-colors">
                                  <td className="border border-hotel-pale px-4 py-3 text-hotel-dark">{monthStat.year}</td>
                                  <td className="border border-hotel-pale px-4 py-3 text-hotel-dark font-semibold">{monthStat.month}월</td>
                                  <td className="border border-hotel-pale px-4 py-3 text-right text-hotel-cyan">{monthStat.totalBookings?.toLocaleString() || 0}</td>
                                  <td className="border border-hotel-pale px-4 py-3 text-right text-hotel-teal font-semibold">₩{parseFloat(monthStat.totalRevenue || 0).toLocaleString()}</td>
                                  <td className="border border-hotel-pale px-4 py-3 text-right text-hotel-cyan">₩{parseFloat(monthStat.averageBookingAmount || 0).toLocaleString()}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {(!statistics.yearlyStatistics || statistics.yearlyStatistics.length === 0) && 
                   (!statistics.monthlyStatistics || statistics.monthlyStatistics.length === 0) && (
                    <div className="text-center text-hotel-cyan py-8">
                      선택한 기간에 통계 데이터가 없습니다.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-hotel-cyan py-8">
                  연도 범위를 선택하고 조회 버튼을 클릭하세요.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 객실 상태별 목록 모달 */}
        {showRoomStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-hotel-dark">
                  {roomStatusFilter === 'available' && '청소 완료 객실'}
                  {roomStatusFilter === 'cleaning' && '청소 필요한 객실'}
                  {roomStatusFilter === 'maintenance' && '보수 중인 객실'}
                </h3>
                <button
                  onClick={() => {
                    setShowRoomStatusModal(false);
                    setRoomStatusFilter(null);
                    setFilteredRooms([]);
                  }}
                  className="text-hotel-cyan hover:text-hotel-teal text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              {filteredRooms.length === 0 ? (
                <p className="text-hotel-cyan text-center py-8">해당 상태의 객실이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {filteredRooms.map((room) => (
                    <div key={room.id} className="border border-hotel-pale rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-hotel-dark mb-2">{room.name}</h4>
                        <div className="mb-3">
                          <span className={`text-sm px-3 py-1 rounded-full inline-block ${
                            room.status === 'CLEAN' ? 'bg-green-100 text-green-800' :
                            room.status === 'DIRTY' ? 'bg-yellow-100 text-yellow-800' :
                            room.status === 'MAINTENANCE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {room.status === 'CLEAN' ? '청소 완료' :
                             room.status === 'DIRTY' ? '청소 필요' :
                             room.status === 'MAINTENANCE' ? '보수 중' :
                             '알 수 없음'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <select
                          value={room.status || 'CLEAN'}
                          onChange={(e) => handleUpdateRoomStatus(room.id, e.target.value)}
                          className="px-4 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky text-sm bg-white"
                        >
                          <option value="CLEAN">청소 완료</option>
                          <option value="DIRTY">청소 필요</option>
                          <option value="MAINTENANCE">보수 중</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

