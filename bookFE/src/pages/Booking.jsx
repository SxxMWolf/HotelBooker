import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomAPI, bookingAPI, paymentAPI } from '../services/api';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const roomId = searchParams.get('roomId');
  const checkInDate = searchParams.get('checkIn');
  const checkOutDate = searchParams.get('checkOut');

  useEffect(() => {
    if (!roomId || !checkInDate || !checkOutDate) {
      navigate('/rooms');
      return;
    }
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getById(roomId);
      setRoom(response.data);
    } catch (error) {
      console.error('객실 로드 실패:', error);
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!room || !checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return room.pricePerNight * nights;
  };

  const handleCreateBooking = async () => {
    if (!paymentMethod) {
      alert('결제 방법을 선택해주세요.');
      return;
    }
    try {
      const response = await bookingAPI.create({
        roomId: parseInt(roomId),
        checkInDate,
        checkOutDate,
        guests: parseInt(guests),
        method: paymentMethod,
      });
      setBooking(response.data);
      alert('예약 및 결제가 완료되었습니다!');
      navigate('/mypage?tab=bookings');
    } catch (error) {
      console.error('예약 생성 에러:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || '예약 생성에 실패했습니다.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-hotel-cyan">로딩 중...</div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-hotel-dark mb-8">예약하기</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">예약 정보</h2>

          <div className="mb-6 bg-hotel-pale p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-hotel-dark">{room.name}</h3>
            <p className="text-hotel-navy">{room.description}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">
                체크인 날짜
              </label>
              <input
                type="date"
                value={checkInDate}
                readOnly
                className="w-full px-3 py-2 border border-hotel-pale rounded-md bg-hotel-pale text-hotel-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">
                체크아웃 날짜
              </label>
              <input
                type="date"
                value={checkOutDate}
                readOnly
                className="w-full px-3 py-2 border border-hotel-pale rounded-md bg-hotel-pale text-hotel-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">
                인원수
              </label>
              <input
                type="number"
                min="1"
                max={room.capacity}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              />
            </div>
          </div>

          <div className="border-t border-hotel-pale pt-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-hotel-cyan">1박 가격</span>
              <span className="font-semibold text-hotel-dark">₩{room.pricePerNight.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-hotel-cyan">숙박 일수</span>
              <span className="font-semibold text-hotel-dark">
                {Math.ceil(
                  (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
                )}박
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="text-hotel-dark">총 금액</span>
              <span className="text-hotel-teal">₩{calculateTotalPrice().toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-hotel-dark">결제 방법 선택</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`px-4 py-3 border-2 rounded-lg font-semibold transition-all hover:scale-105 ${
                  paymentMethod === 'CARD'
                    ? 'border-hotel-blue bg-hotel-pale-sky text-hotel-blue'
                    : 'border-hotel-blue text-hotel-blue hover:bg-hotel-pale-sky'
                }`}
              >
                카드 결제
              </button>
              <button
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`px-4 py-3 border-2 rounded-lg font-semibold transition-all hover:scale-105 ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-hotel-teal bg-hotel-pale-sky text-hotel-teal'
                    : 'border-hotel-teal text-hotel-teal hover:bg-hotel-pale-sky'
                }`}
              >
                계좌이체
              </button>
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`px-4 py-3 border-2 rounded-lg font-semibold transition-all hover:scale-105 ${
                  paymentMethod === 'CASH'
                    ? 'border-hotel-cyan bg-hotel-pale-sky text-hotel-cyan'
                    : 'border-hotel-cyan text-hotel-cyan hover:bg-hotel-pale-sky'
                }`}
              >
                현금 결제
              </button>
            </div>
          </div>

          <button
            onClick={handleCreateBooking}
            disabled={!paymentMethod}
            className={`w-full px-4 py-3 text-white rounded-lg font-semibold shadow-lg transition-all hover:scale-105 ${
              paymentMethod
                ? 'bg-hotel-navy hover:bg-hotel-teal'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            예약 및 결제하기
          </button>
        </div>
    </div>
  );
};

export default Booking;

