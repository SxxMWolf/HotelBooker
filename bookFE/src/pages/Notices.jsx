import { useEffect, useState } from 'react';
import { noticeAPI } from '../services/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotices, setExpandedNotices] = useState(new Set());

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await noticeAPI.getAll();
        setNotices(response.data);
      } catch (error) {
        console.error('공지사항 로드 실패:', error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-hotel-cyan">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-hotel-dark mb-8">공지사항</h1>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-hotel-pale-sky">
        {notices.length === 0 ? (
          <div className="p-8 text-center text-hotel-cyan">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-hotel-pale-sky">
            {notices.map((notice) => {
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
  );
};

export default Notices;

