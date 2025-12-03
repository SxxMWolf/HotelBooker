import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingAPI, paymentAPI, reviewAPI, roomAPI } from '../services/api';

const MyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviewableBookings, setReviewableBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // URL 파라미터에서 탭 정보 읽기
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'bookings', 'payments', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    fetchData();
  }, [user, searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, bookingsRes, reviewableBookingsRes, paymentsRes, reviewsRes] = await Promise.all([
        userAPI.getProfile(),
        bookingAPI.getAll(),
        bookingAPI.getReviewable(),
        paymentAPI.getAll(),
        reviewAPI.getMyReviews(),
      ]);
      setProfile(profileRes.data);
      setBookings(bookingsRes.data);
      setReviewableBookings(reviewableBookingsRes.data);
      setPayments(paymentsRes.data);
      setReviews(reviewsRes.data);
      setFormData({
        email: profileRes.data.email || '',
        name: profileRes.data.name || '',
        phone: profileRes.data.phone || '',
        password: '',
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      if (error.response?.data?.message) {
        console.error('에러 메시지:', error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
      };
      await userAPI.updateProfile(updateData);
      setEditMode(false);
      fetchData();
      alert('프로필이 업데이트되었습니다.');
    } catch (error) {
      alert(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('정말 예약을 취소하시겠습니까?')) return;
    try {
      await bookingAPI.cancel(bookingId);
      fetchData();
      alert('예약이 취소되었습니다.');
    } catch (error) {
      alert(error.response?.data?.message || '예약 취소에 실패했습니다.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('정말 예약 내역을 삭제하시겠습니까?\n삭제된 예약 내역은 복구할 수 없습니다.')) return;
    try {
      await bookingAPI.delete(bookingId);
      fetchData();
      alert('예약 내역이 삭제되었습니다.');
    } catch (error) {
      alert(error.response?.data?.message || '예약 내역 삭제에 실패했습니다.');
    }
  };

  const handleOpenReviewForm = (booking) => {
    setSelectedBooking(booking);
    setSelectedReview(null);
    setIsEditingReview(false);
    setShowReviewForm(true);
      setReviewForm({ rating: 5, comment: '' });
  };

  const handleOpenEditReviewForm = (review) => {
    setSelectedReview(review);
    setSelectedBooking(null);
    setIsEditingReview(true);
    setShowReviewForm(true);
    setReviewForm({ 
      rating: review.rating,
      comment: review.comment || '' 
    });
  };

  const handleShowRoomInfo = async (booking) => {
    try {
      const response = await roomAPI.getById(booking.roomId);
      setSelectedRoom(response.data);
      setShowRoomInfo(true);
    } catch (error) {
      alert('객실 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleShowPaymentDetails = async (payment) => {
    try {
      // 결제 정보에서 예약 정보 가져오기
      const bookingResponse = await bookingAPI.getById(payment.bookingId);
      setSelectedBooking(bookingResponse.data);
      setSelectedPayment(payment);
      setShowPaymentInfo(true);
    } catch (error) {
      alert('결제 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (isEditingReview && selectedReview) {
        // 리뷰 수정
        await reviewAPI.update(selectedReview.id, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        alert('리뷰가 수정되었습니다.');
      } else if (selectedBooking) {
        // 리뷰 작성
        await reviewAPI.create({
          bookingId: selectedBooking.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        alert('리뷰가 작성되었습니다.');
      }
      setShowReviewForm(false);
      setSelectedBooking(null);
      setSelectedReview(null);
      setIsEditingReview(false);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || '리뷰 처리에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말 회원 탈퇴를 하시겠습니까?\n모든 예약 정보와 리뷰가 삭제되며 복구할 수 없습니다.')) {
      return;
    }
    
    if (!confirm('회원 탈퇴를 최종 확인합니다. 정말 진행하시겠습니까?')) {
      return;
    }

    try {
      await userAPI.deleteAccount();
      alert('회원 탈퇴가 완료되었습니다.');
      logout();
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-hotel-cyan">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-hotel-dark mb-8">마이페이지</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-hotel-navy text-white shadow-lg'
              : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
          }`}
        >
          프로필 관리
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
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'payments'
              ? 'bg-hotel-navy text-white shadow-lg'
              : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
          }`}
        >
          결제 내역
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'reviews'
              ? 'bg-hotel-navy text-white shadow-lg'
              : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
          }`}
        >
          리뷰 작성
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-hotel-dark">프로필 관리</h2>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                수정
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchData();
                  }}
                  className="px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                >
                  취소
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">아이디</label>
              <input
                type="text"
                value={profile?.username}
                disabled
                className="w-full px-3 py-2 border border-hotel-pale rounded-md bg-hotel-pale text-hotel-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">전화번호</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              />
            </div>
            {editMode && (
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  비밀번호 (변경 시에만 입력)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
                />
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-hotel-pale">
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                로그아웃
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-white text-red-500 border border-red-500 rounded-lg hover:bg-red-50 font-semibold transition-all"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">예약 관리</h2>
          {bookings.length === 0 ? (
            <p className="text-hotel-cyan text-center py-8">예약 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {[...bookings]
                .sort((a, b) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const aCheckOut = new Date(a.checkOutDate);
                  const bCheckOut = new Date(b.checkOutDate);
                  const aIsPast = aCheckOut < today;
                  const bIsPast = bCheckOut < today;
                  
                  // 다가오는 예약을 먼저 (isPast가 false인 것)
                  if (aIsPast !== bIsPast) {
                    return aIsPast ? 1 : -1;
                  }
                  
                  // 같은 그룹 내에서는 체크인 날짜 순으로 정렬 (가까운 날짜부터)
                  const aCheckIn = new Date(a.checkInDate);
                  const bCheckIn = new Date(b.checkInDate);
                  return aCheckIn - bCheckIn;
                })
                .map((booking) => {
                const checkOutDate = new Date(booking.checkOutDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = checkOutDate < today;
                const checkInDate = new Date(booking.checkInDate);
                const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
                const isOneWeekOrMore = daysUntilCheckIn >= 7;
                
                return (
                  <div
                    key={booking.id}
                    className={`border rounded-xl p-6 transition-all ${
                      isPast
                        ? 'border-gray-300 bg-gray-50 opacity-75'
                        : 'border-hotel-pale hover:bg-hotel-pale-sky cursor-pointer'
                    }`}
                    onClick={!isPast ? () => handleShowRoomInfo(booking) : undefined}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-hotel-dark">{booking.roomName}</h3>
                          {isPast && (
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                              지난 예약
                            </span>
                          )}
                          {!isPast && (
                            <span className="text-xs px-2 py-1 bg-hotel-pale-sky text-hotel-teal rounded-full">
                              다가오는 예약
                            </span>
                          )}
                        </div>
                        <p className={`mb-1 ${isPast ? 'text-gray-500' : 'text-hotel-cyan'}`}>
                          {new Date(booking.checkInDate).toLocaleDateString('ko-KR')} ~{' '}
                          {new Date(booking.checkOutDate).toLocaleDateString('ko-KR')}
                        </p>
                        <p className={`mb-2 ${isPast ? 'text-gray-500' : 'text-hotel-cyan'}`}>
                          인원: {booking.guests}명
                        </p>
                        <p className={`text-xl font-semibold mb-2 ${isPast ? 'text-gray-600' : 'text-hotel-teal'}`}>
                          ₩{booking.totalPrice.toLocaleString()}
                        </p>
                        {booking.status === 'CANCELLED' && (
                          <p className="inline-block px-3 py-1 rounded-lg text-sm mt-2 font-medium bg-red-100 text-red-800 border border-red-300">
                            취소됨
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'COMPLETED' && isPast && (
                          <button
                            onClick={() => handleOpenReviewForm(booking)}
                            className="px-4 py-2 bg-hotel-teal text-white rounded-lg hover:bg-hotel-cyan font-semibold shadow-lg transition-all"
                          >
                            리뷰 작성
                          </button>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold shadow-lg transition-all"
                          >
                            예약 내역 삭제
                          </button>
                        )}
                        {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && isOneWeekOrMore && !isPast && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-white text-red-500 border border-red-500 rounded-lg hover:bg-red-50 font-semibold transition-all"
                          >
                            취소
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">결제 내역</h2>
          {payments.length === 0 ? (
            <p className="text-hotel-cyan text-center py-8">결제 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all cursor-pointer"
                  onClick={() => handleShowPaymentDetails(payment)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xl font-semibold text-hotel-teal mb-2">
                        ₩{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-hotel-cyan mb-1">
                        결제 방법: {payment.method === 'CARD' ? '카드' : payment.method === 'BANK_TRANSFER' ? '계좌이체' : '현금'}
                      </p>
                      <p className="text-hotel-cyan mb-1">
                        결제일: {new Date(payment.paymentDate).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-hotel-cyan">거래번호: {payment.transactionId}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        payment.status === 'COMPLETED'
                          ? 'bg-hotel-pale-sky text-hotel-teal border border-hotel-teal'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}
                    >
                      {payment.status === 'COMPLETED' ? '완료' : '대기중'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-8">
          {/* 리뷰 작성 가능한 예약 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
            <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">리뷰 작성</h2>
            <p className="text-hotel-cyan mb-6 text-sm">
              체크아웃 후 1달 이내에 리뷰를 작성할 수 있습니다.
            </p>
            {reviewableBookings.length === 0 ? (
              <p className="text-hotel-cyan text-center py-8">리뷰를 작성할 수 있는 예약이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {reviewableBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-hotel-dark mb-2">{booking.roomName}</h3>
                        <p className="text-hotel-cyan mb-1">
                          체크인: {new Date(booking.checkInDate).toLocaleDateString('ko-KR')}
                        </p>
                        <p className="text-hotel-cyan mb-1">
                          체크아웃: {new Date(booking.checkOutDate).toLocaleDateString('ko-KR')}
                        </p>
                        <p className="text-hotel-cyan mb-2">인원: {booking.guests}명</p>
                        <p className="text-xl font-semibold text-hotel-teal mb-2">
                          ₩{booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenReviewForm(booking)}
                        className="px-4 py-2 bg-hotel-teal text-white rounded-lg hover:bg-hotel-cyan font-semibold shadow-lg transition-all"
                      >
                        리뷰 작성
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 내가 작성한 리뷰 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
            <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">내가 작성한 리뷰</h2>
            {reviews.length === 0 ? (
              <p className="text-hotel-cyan text-center py-8">작성한 리뷰가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all">
                    <div className="flex items-center justify-between mb-0">
                      <p className="font-semibold text-hotel-teal text-lg">⭐ {review.rating}</p>
                      <div className="flex gap-2">
                        <p className="text-sm text-hotel-cyan">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                        <button
                          onClick={() => handleOpenEditReviewForm(review)}
                          className="px-3 py-1 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal text-sm font-semibold transition-all"
                        >
                          수정
                        </button>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-hotel-dark text-center leading-relaxed -mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리뷰 작성/수정 모달 */}
      {showReviewForm && (selectedBooking || selectedReview) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-hotel-dark">
              {isEditingReview ? '리뷰 수정' : '리뷰 작성'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  평점
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
                >
                  <option value={1}>1점</option>
                  <option value={2}>2점</option>
                  <option value={3}>3점</option>
                  <option value={4}>4점</option>
                  <option value={5}>5점</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  리뷰 내용
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
                  placeholder="리뷰 내용을 작성해주세요..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                {isEditingReview ? '저장' : '작성'}
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedBooking(null);
                  setSelectedReview(null);
                  setIsEditingReview(false);
                }}
                className="flex-1 px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 정보 모달 */}
      {showPaymentInfo && selectedBooking && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-hotel-dark">결제 상세 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  객실명
                </label>
                <p className="text-hotel-cyan text-lg font-semibold">
                  {selectedBooking.roomName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  체크인 / 체크아웃
                </label>
                <p className="text-hotel-cyan text-lg">
                  {new Date(selectedBooking.checkInDate).toLocaleDateString('ko-KR')} ~ {new Date(selectedBooking.checkOutDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  인원
                </label>
                <p className="text-hotel-cyan text-lg">
                  {selectedBooking.guests}명
                </p>
              </div>
              <div className="border-t border-hotel-pale pt-4 mt-4">
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  결제 수단
                </label>
                <p className="text-hotel-cyan text-lg">
                  {selectedPayment.method === 'CARD' 
                    ? '카드' 
                    : selectedPayment.method === 'BANK_TRANSFER' 
                    ? '계좌이체' 
                    : '현금'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  결제 시간
                </label>
                <p className="text-hotel-cyan text-lg">
                  {new Date(selectedPayment.paymentDate).toLocaleString('ko-KR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  결제 금액
                </label>
                <p className="text-hotel-cyan text-lg font-semibold">
                  ₩{selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              {selectedPayment.transactionId && (
                <div>
                  <label className="block text-sm font-medium text-hotel-dark mb-2">
                    거래번호
                  </label>
                  <p className="text-hotel-cyan text-sm">
                    {selectedPayment.transactionId}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  결제 상태
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedPayment.status === 'COMPLETED'
                      ? 'bg-hotel-pale-sky text-hotel-teal border border-hotel-teal'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`}
                >
                  {selectedPayment.status === 'COMPLETED' ? '완료' : '대기중'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowPaymentInfo(false);
                  setSelectedBooking(null);
                  setSelectedPayment(null);
                }}
                className="w-full px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 객실 정보 모달 */}
      {showRoomInfo && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 border border-hotel-pale shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-hotel-dark">객실 정보</h3>
              <button
                onClick={() => {
                  setShowRoomInfo(false);
                  setSelectedRoom(null);
                }}
                className="text-hotel-cyan hover:text-hotel-teal text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {selectedRoom.imageUrl && (
                <img
                  src={selectedRoom.imageUrl}
                  alt={selectedRoom.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div>
                <h4 className="text-xl font-semibold text-hotel-dark mb-2">{selectedRoom.name}</h4>
                <p className="text-hotel-cyan mb-4">{selectedRoom.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-hotel-cyan mb-1">객실 타입</p>
                  <p className="font-semibold text-hotel-dark">{selectedRoom.type}</p>
                </div>
                <div>
                  <p className="text-sm text-hotel-cyan mb-1">전망</p>
                  <p className="font-semibold text-hotel-dark">{selectedRoom.viewType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-hotel-cyan mb-1">수용 인원</p>
                  <p className="font-semibold text-hotel-dark">{selectedRoom.capacity}명</p>
                </div>
                <div>
                  <p className="text-sm text-hotel-cyan mb-1">침대 수</p>
                  <p className="font-semibold text-hotel-dark">{selectedRoom.bedCount || '-'}개</p>
                </div>
                <div>
                  <p className="text-sm text-hotel-cyan mb-1">1박 가격</p>
                  <p className="font-semibold text-hotel-teal text-lg">₩{selectedRoom.pricePerNight?.toLocaleString()}</p>
                </div>
                {selectedRoom.averageRating && (
                  <div>
                    <p className="text-sm text-hotel-cyan mb-1">평점</p>
                    <p className="font-semibold text-hotel-dark">
                      ⭐ {selectedRoom.averageRating.toFixed(1)} ({selectedRoom.reviewCount || 0}개 리뷰)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;

