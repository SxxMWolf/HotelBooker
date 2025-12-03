import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomAPI, reviewAPI } from '../services/api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedViewType, setSelectedViewType] = useState(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [showViewSelectionModal, setShowViewSelectionModal] = useState(false);
  const [roomForBooking, setRoomForBooking] = useState(null);
  const [viewTypeRooms, setViewTypeRooms] = useState({});
  const navigate = useNavigate();

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params = checkInDate && checkOutDate ? { checkInDate, checkOutDate } : {};
      const response = await roomAPI.getAll(checkInDate, checkOutDate);
      setRooms(response.data);
    } catch (error) {
      console.error('객실 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleViewDetails = async (room) => {
    setSelectedRoom(room);
    setSelectedViewType(null);
    setSelectedRoomForBooking(null);
    try {
      const response = await reviewAPI.getByRoomId(room.id);
      setReviews(response.data);
      
      // 같은 타입의 모든 방 가져오기
      const roomsResponse = await roomAPI.getByType(room.type);
      setAvailableRooms(roomsResponse.data);
      
      // 기본으로 첫 번째 방 선택
      if (roomsResponse.data.length > 0) {
        setSelectedRoomForBooking(roomsResponse.data[0]);
        setSelectedViewType(roomsResponse.data[0].viewType);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const handleViewTypeChange = async (viewType) => {
    if (!selectedRoom) return;
    setSelectedViewType(viewType);
    try {
      const response = await roomAPI.getByTypeAndViewType(selectedRoom.type, viewType);
      if (response.data.length > 0) {
        setSelectedRoomForBooking(response.data[0]);
      }
    } catch (error) {
      console.error('방 로드 실패:', error);
    }
  };

  const handleBookClick = async (room) => {
    if (!checkInDate || !checkOutDate) {
      alert('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    
    setRoomForBooking(room);
    
    // 같은 타입의 모든 방 가져오기 (날짜 고려)
    try {
      const roomsResponse = await roomAPI.getByType(room.type, checkInDate, checkOutDate);
      const rooms = roomsResponse.data;
      
      // 뷰 타입별로 그룹화
      const groupedByView = {};
      ['오션뷰', '마운틴뷰'].forEach(viewType => {
        const viewRooms = rooms.filter(r => r.viewType === viewType);
        groupedByView[viewType] = viewRooms;
      });
      
      setViewTypeRooms(groupedByView);
      setShowViewSelectionModal(true);
    } catch (error) {
      console.error('방 로드 실패:', error);
      alert('방 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleViewSelect = async (viewType) => {
    if (!roomForBooking) return;
    
    try {
      // 날짜를 고려하여 해당 뷰 타입의 예약 가능한 방 가져오기
      const response = await roomAPI.getByTypeAndViewType(roomForBooking.type, viewType, checkInDate, checkOutDate);
      const availableRooms = response.data.filter(r => r.available && !r.allBooked);
      
      if (availableRooms.length === 0) {
        alert('해당 뷰 옵션의 남은 방이 없습니다.');
        return;
      }
      
      // 첫 번째 예약 가능한 방 선택
      const selectedRoom = availableRooms[0];
      navigate(`/booking?roomId=${selectedRoom.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}`);
    } catch (error) {
      console.error('방 로드 실패:', error);
      alert('방 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleBook = (roomId) => {
    if (!checkInDate || !checkOutDate) {
      alert('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    navigate(`/booking?roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}`);
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
      <h1 className="text-4xl font-bold text-hotel-dark mb-8">객실 선택</h1>

      {/* 날짜 필터 */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-hotel-pale-sky">
        <form onSubmit={handleFilter} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-hotel-dark mb-2">
              체크인 날짜
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-4 py-3 border border-hotel-pale-sky rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-hotel-dark mb-2">
              체크아웃 날짜
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full px-4 py-3 border border-hotel-pale-sky rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              min={checkInDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all hover:scale-105"
          >
            검색
          </button>
        </form>
      </div>

      {/* 객실 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-hotel-pale-sky hover:shadow-xl transition-all hover:scale-105">
            {room.imageUrl && (
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-hotel-dark">{room.type}</h3>
                {room.allBooked && checkInDate && checkOutDate && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                    자리 없다
                  </span>
                )}
              </div>
              <p className="text-hotel-navy mb-4 line-clamp-2">{room.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-hotel-cyan">수용인원: {room.capacity}명</p>
                  {room.averageRating && (
                    <p className="text-sm text-hotel-sky font-semibold">
                      ⭐ {room.averageRating.toFixed(1)} ({room.reviewCount}개 리뷰)
                    </p>
                  )}
                </div>
                <p className="text-2xl font-bold text-hotel-teal">
                  ₩{room.pricePerNight.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(room)}
                  className="flex-1 px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-medium transition-colors"
                >
                  상세보기
                </button>
                <button
                  onClick={() => handleBookClick(room)}
                  className="flex-1 px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!room.available || (room.allBooked && checkInDate && checkOutDate)}
                >
                  {room.allBooked && checkInDate && checkOutDate ? '자리 없다' : '예약하기'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 text-hotel-cyan">
          예약 가능한 객실이 없습니다.
        </div>
      )}

      {/* 상세 모달 */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-hotel-pale-sky">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-hotel-dark">{selectedRoom.type}</h2>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-hotel-cyan hover:text-hotel-dark text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              {selectedRoom.imageUrl && (
                <img
                  src={selectedRoom.imageUrl}
                  alt={selectedRoom.name}
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
              )}
              <p className="text-hotel-navy mb-4">{selectedRoom.description}</p>
              
              {/* 뷰 타입 선택 */}
              {availableRooms.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    {['오션뷰', '마운틴뷰'].map((viewType) => {
                      const hasViewType = availableRooms.some(r => r.viewType === viewType);
                      return (
                        <button
                          key={viewType}
                          onClick={() => handleViewTypeChange(viewType)}
                          disabled={!hasViewType}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedViewType === viewType
                              ? 'bg-hotel-navy text-white'
                              : hasViewType
                              ? 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {viewType}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 bg-hotel-pale-sky p-4 rounded-lg">
                <div>
                  <p className="text-sm text-hotel-cyan">타입</p>
                  <p className="font-semibold text-hotel-dark">{selectedRoom.type}</p>
                </div>
                <div>
                  <p className="text-sm text-hotel-cyan">수용인원</p>
                  <p className="font-semibold text-hotel-dark">{selectedRoom.capacity}명</p>
                </div>
                {selectedRoomForBooking && (
                  <>
                    <div>
                      <p className="text-sm text-hotel-cyan">침대 개수</p>
                      <p className="font-semibold text-hotel-dark">{selectedRoomForBooking.bedCount || '-'}개</p>
                    </div>
                    <div>
                      <p className="text-sm text-hotel-cyan">뷰</p>
                      <p className="font-semibold text-hotel-dark">{selectedRoomForBooking.viewType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-hotel-cyan">금연</p>
                      <p className="font-semibold text-hotel-dark">✓ 금연</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-hotel-cyan">1박 가격</p>
                  <p className="font-semibold text-hotel-teal text-xl">
                    ₩{selectedRoomForBooking ? selectedRoomForBooking.pricePerNight.toLocaleString() : selectedRoom.pricePerNight.toLocaleString()}
                  </p>
                </div>
                {selectedRoom.averageRating && (
                  <div>
                    <p className="text-sm text-hotel-cyan">평점</p>
                    <p className="font-semibold text-hotel-sky">
                      ⭐ {selectedRoom.averageRating.toFixed(1)} ({selectedRoom.reviewCount}개 리뷰)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 text-hotel-dark">리뷰</h3>
                {reviews.length === 0 ? (
                  <p className="text-hotel-cyan">아직 리뷰가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-hotel-pale-sky pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-hotel-dark">{review.userName}</p>
                          <p className="text-hotel-sky font-semibold">⭐ {review.rating}</p>
                        </div>
                        {review.comment && <p className="text-hotel-navy">{review.comment}</p>}
                        <p className="text-sm text-hotel-cyan mt-2">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleBook(selectedRoomForBooking ? selectedRoomForBooking.id : selectedRoom.id)}
                className="mt-6 w-full px-4 py-3 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedRoomForBooking?.available || (selectedRoomForBooking?.allBooked && checkInDate && checkOutDate)}
              >
                {selectedRoomForBooking?.allBooked && checkInDate && checkOutDate ? '자리 없다' : '예약하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 뷰 선택 모달 */}
      {showViewSelectionModal && roomForBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-hotel-pale-sky">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-hotel-dark">{roomForBooking.type} 뷰 선택</h2>
                <button
                  onClick={() => {
                    setShowViewSelectionModal(false);
                    setRoomForBooking(null);
                    setViewTypeRooms({});
                  }}
                  className="text-hotel-cyan hover:text-hotel-dark text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                {['오션뷰', '마운틴뷰'].map((viewType) => {
                  const rooms = viewTypeRooms[viewType] || [];
                  const availableRooms = rooms.filter(r => r.available && !r.allBooked);
                  const isAvailable = availableRooms.length > 0;
                  
                  return (
                    <button
                      key={viewType}
                      onClick={() => isAvailable && handleViewSelect(viewType)}
                      disabled={!isAvailable}
                      className={`w-full px-6 py-4 rounded-lg font-semibold transition-all text-left ${
                        isAvailable
                          ? 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan border-2 border-hotel-pale-sky hover:border-hotel-sky'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{viewType}</span>
                        {!isAvailable && (
                          <span className="text-sm text-red-600 font-medium">남은 방이 없습니다</span>
                        )}
                        {isAvailable && (
                          <span className="text-sm text-hotel-teal font-medium">예약 가능</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;

