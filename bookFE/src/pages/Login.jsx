import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(id, password);
    if (result.success) {
      // 관리자면 관리자 대시보드로, 일반 사용자면 홈으로
      if (result.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hotel-pale-sky via-white to-hotel-pale-sky py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-hotel-pale-sky">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-hotel-dark mb-2">
              로그인
            </h2>
            <p className="text-hotel-cyan">호텔 예약 시스템에 오신 것을 환영합니다</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-hotel-dark mb-2">
                  아이디
                </label>
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-hotel-pale-sky placeholder-hotel-cyan text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all"
                  placeholder="아이디를 입력하세요"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-hotel-dark mb-2">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-hotel-pale-sky placeholder-hotel-cyan text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-hotel-navy hover:bg-hotel-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-sky transition-all shadow-lg hover:shadow-xl"
              >
                로그인
              </button>
            </div>

            <div className="flex justify-between text-sm pt-4 border-t border-hotel-pale-sky">
              <Link to="/register" className="text-hotel-teal hover:text-hotel-navy font-medium transition-colors">
                계정이 없으신가요? 회원가입
              </Link>
              <div className="space-x-2">
                <Link to="/forgot-id" className="text-hotel-cyan hover:text-hotel-navy transition-colors">
                  아이디 찾기
                </Link>
                <span className="text-hotel-pale-sky">|</span>
                <Link to="/forgot-password" className="text-hotel-cyan hover:text-hotel-navy transition-colors">
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
