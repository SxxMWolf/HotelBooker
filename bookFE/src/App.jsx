import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotId from './pages/ForgotId';
import ForgotPassword from './pages/ForgotPassword';
import Rooms from './pages/Rooms';
import Booking from './pages/Booking';
import MyPage from './pages/MyPage';
import Notices from './pages/Notices';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-id" element={<ForgotId />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/notices" element={<Notices />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
