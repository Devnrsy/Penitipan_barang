import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import History from './pages/History';
import Pengambilan from './pages/Pengambilan';

const PrivateRouter = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#F3C263] font-black tracking-widest animate-pulse uppercase text-xs">
          Synchronizing System...
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRouter>
              <Dashboard />
            </PrivateRouter>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRouter>
              <Inventory />
            </PrivateRouter>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRouter>
              <Profile />
            </PrivateRouter>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRouter>
              <History />
            </PrivateRouter>
          }
        />
        <Route
          path="/pengambilan"
          element={
            <PrivateRouter>
              <Pengambilan />
            </PrivateRouter>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      {/* 
        Container Luar: 
        - Di desktop: Background hitam pekat.
        - Di mobile: Background langsung mengikuti warna aplikasi (#1a1a1a).
      */}
      <div className="min-h-screen bg-black sm:bg-black flex justify-center items-center">
        {/* 
          Frame Utama:
          - w-full h-screen: Full total di HP.
          - sm:max-w-[430px] sm:h-[92vh]: Jadi kotak HP kalau dibuka di laptop.
          - sm:rounded-[3rem]: Lengkungan hanya muncul di laptop.
        */}
        <div className="w-full h-screen sm:h-[92vh] sm:max-w-[430px] bg-[#1a1a1a] relative shadow-2xl sm:rounded-[3rem] overflow-hidden sm:border sm:border-white/5">
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
