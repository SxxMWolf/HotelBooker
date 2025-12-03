import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { noticeAPI } from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await noticeAPI.getAll();
        setNotices(response.data);
      } catch (error) {
        console.error('공지사항 로드 실패:', error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="bg-gradient-to-r from-hotel-dark via-hotel-navy to-hotel-teal text-white rounded-2xl p-12 mb-8 shadow-xl">
          <h1 className="text-5xl font-bold mb-4">
            {user ? `${user.id || user.username}님, 환영합니다!` : '호텔 예약 시스템에 오신 것을 환영합니다'}
          </h1>
          <p className="text-xl text-hotel-pale-sky mb-8">
            편안하고 안락한 숙박을 위한 최고의 선택
          </p>
          {user ? (
            <div>
              <Link
                to="/rooms"
                className="inline-block px-8 py-4 bg-hotel-sky text-white rounded-lg hover:bg-hotel-light-cyan text-lg font-semibold shadow-lg transition-all hover:scale-105"
              >
                객실 선택하기
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-block px-8 py-4 bg-hotel-sky text-white rounded-lg hover:bg-hotel-light-cyan text-lg font-semibold shadow-lg transition-all hover:scale-105"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="inline-block px-8 py-4 bg-white text-hotel-navy rounded-lg hover:bg-hotel-pale-sky text-lg font-semibold shadow-lg transition-all hover:scale-105"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-hotel-dark mb-6">공지사항</h2>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-hotel-pale-sky">
          {notices.length === 0 ? (
            <div className="p-8 text-center text-hotel-cyan">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-hotel-pale-sky">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className={`p-6 hover:bg-hotel-pale-sky transition-colors ${
                    notice.important ? 'bg-hotel-pale-sky border-l-4 border-hotel-sky' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-hotel-dark">
                        {notice.title}
                      </h3>
                      <p className="mt-2 text-hotel-navy">{notice.content}</p>
                      <p className="mt-2 text-sm text-hotel-cyan">
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

