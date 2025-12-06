import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { noticeAPI } from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [expandedNotices, setExpandedNotices] = useState(new Set());

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

  const toggleNotice = (noticeId) => {
    const newExpanded = new Set(expandedNotices);
    if (newExpanded.has(noticeId)) {
      newExpanded.delete(noticeId);
    } else {
      newExpanded.add(noticeId);
    }
    setExpandedNotices(newExpanded);
  };

  const displayedNotices = notices.slice(0, 5);
  const hasMoreNotices = notices.length > 5;

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-hotel-dark">공지사항</h2>
          {hasMoreNotices && (
            <Link
              to="/notices"
              className="text-hotel-sky hover:text-hotel-teal font-semibold transition-colors"
            >
              더보기 →
            </Link>
          )}
        </div>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-hotel-pale-sky">
          {displayedNotices.length === 0 ? (
            <div className="p-8 text-center text-hotel-cyan">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-hotel-pale-sky">
              {displayedNotices.map((notice) => {
                const isExpanded = expandedNotices.has(notice.id);
                return (
                  <li
                    key={notice.id}
                    className={`p-6 transition-colors ${
                      notice.important ? 'bg-hotel-pale-sky border-l-4 border-hotel-sky' : ''
                    }`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleNotice(notice.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {notice.important && (
                              <span className="px-2 py-1 bg-hotel-sky text-white text-xs font-semibold rounded">
                                중요
                              </span>
                            )}
                            <h3 className="text-lg font-semibold text-hotel-dark">
                              {notice.title}
                            </h3>
                          </div>
                          {isExpanded && (
                            <div className="mt-3 mb-3">
                              <p className="text-hotel-navy whitespace-pre-wrap">
                                {notice.content}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-hotel-cyan mt-2">
                            <span>
                              {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span>관리자</span>
                          </div>
                        </div>
                        <button
                          className="ml-4 text-hotel-sky hover:text-hotel-teal transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotice(notice.id);
                          }}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

