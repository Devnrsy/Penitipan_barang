/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  LogOut,
  Camera,
  Check,
  Edit3,
  Award,
  Package,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth'; // Pastikan path hook auth kamu benar

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Ambil fungsi logout dan data user login
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    name: 'Admin User',
    email: user?.email || 'admin@penitipan.com',
    role: 'Full Access',
    photo: null,
    joined: 'Mei 2026',
    tasks: 1240,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Ambil profil yang tersimpan di lokal (seperti foto dan nama custom)
    const savedData = localStorage.getItem('userProfile');
    if (savedData) {
      setUserData(JSON.parse(savedData));
    } else if (user?.email) {
      // Jika belum ada di lokal, set email dari session login
      setUserData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleToggleEdit = () => {
    if (isEditing) {
      localStorage.setItem('userProfile', JSON.stringify(userData));
      Swal.fire({
        icon: 'success',
        title: 'PROFIL UPDATED',
        text: 'Data terbaru sudah masuk sistem, Bre!',
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#F3C263',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'rounded-[2rem] border border-white/5 shadow-2xl',
        },
      });
    }
    setIsEditing(!isEditing);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedData = { ...userData, photo: reader.result };
        setUserData(updatedData);
        localStorage.setItem('userProfile', JSON.stringify(updatedData));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutSession = () => {
    Swal.fire({
      title: 'Sudah Selesai?',
      text: 'Pastikan seluruh laporan hari ini telah diperiksa sebelum keluar.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'YA, KELUAR',
      cancelButtonText: 'KEMBALI',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#F3C263',
      cancelButtonColor: '#333',
      reverseButtons: true,
      showClass: { popup: 'animate__animated animate__zoomIn' },
      customClass: {
        popup: 'rounded-[2.5rem] border border-white/10',
        confirmButton:
          'rounded-2xl px-8 text-black font-black uppercase tracking-widest text-xs',
        cancelButton:
          'rounded-2xl px-8 font-black uppercase tracking-widest text-xs text-gray-400',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'MENGAKHIRI SESI...',
          background: '#1a1a1a',
          color: '#fff',
          timer: 1000,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        }).then(() => {
          logout(); // Memanggil fungsi logout asli dari useAuth
        });
      }
    });
  };

  return (
    <div className="w-full h-full bg-black flex justify-center items-center font-sans overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#F3C263]/10 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-emerald-500/5 blur-[100px] rounded-full animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[430px] h-screen sm:h-[92vh] sm:rounded-[3.5rem] bg-[#111]/80 backdrop-blur-2xl flex flex-col relative overflow-hidden text-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/10"
      >
        {/* Header */}
        <header className="p-8 pt-12 flex justify-start items-center z-30">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#F3C263] transition-all"
          >
            <div className="w-12 h-12 bg-[#222] rounded-2xl flex items-center justify-center border border-white/10 group-active:scale-90 transition-all shadow-lg">
              <ArrowLeft size={20} />
            </div>
            <span className="group-hover:translate-x-1 transition-transform">
              Kembali
            </span>
          </button>
        </header>

        <main className="flex-grow px-8 z-20 overflow-y-auto no-scrollbar pb-10">
          {/* Hero Profile Section */}
          <section className="flex flex-col items-center mb-10">
            <div className="relative group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-12px] border border-dashed border-[#F3C263]/40 rounded-[3.5rem]"
              />

              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-tr from-[#F3C263] via-[#f7d692] to-[#F3C263] p-[4px] relative shadow-[0_20px_50px_rgba(243,194,99,0.2)]">
                <div className="w-full h-full rounded-[2.8rem] bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                  {userData.photo ? (
                    <img
                      src={userData.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-[#F3C263] opacity-20" />
                  )}

                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-[5px] border-[#111] flex items-center justify-center shadow-lg">
                <Award size={18} className="text-white" />
              </div>
            </div>

            <div className="mt-8 text-center space-y-1">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.input
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#222] border-2 border-[#F3C263] rounded-2xl px-4 py-2 text-xl font-black text-center focus:outline-none w-full shadow-2xl text-white italic"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                  />
                ) : (
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-black italic tracking-tighter"
                  >
                    {userData.name}
                  </motion.h2>
                )}
              </AnimatePresence>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Verified Super Admin
              </p>
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#222]/40 p-5 rounded-[2.2rem] border border-white/5">
              <Package size={20} className="text-[#F3C263] mb-2" />
              <p className="text-[18px] font-black italic leading-none">
                {userData.tasks}
              </p>
              <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                Processed
              </p>
            </div>
            <div className="bg-[#222]/40 p-5 rounded-[2.2rem] border border-white/5">
              <Clock size={20} className="text-[#F3C263] mb-2" />
              <p className="text-[18px] font-black italic leading-none">
                {userData.joined}
              </p>
              <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                Experience
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 px-2 mb-4">
              Core Information
            </h3>

            <InfoTile
              icon={<Mail size={18} />}
              label="Email Address"
              value={userData.email}
              isEditing={false} // Email biasanya tidak bisa diedit sembarangan
            />

            <InfoTile
              icon={<Shield size={18} />}
              label="System Security"
              value={userData.role}
              isEditing={false}
            />
          </div>

          {/* Bottom Actions */}
          <div className="mt-10 space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleEdit}
              className={`w-full py-5 rounded-[2.2rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
                isEditing
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-[#F3C263] text-black shadow-[#F3C263]/20'
              }`}
            >
              {isEditing ? (
                <Check size={18} strokeWidth={3} />
              ) : (
                <Edit3 size={18} />
              )}
              {isEditing ? 'Save System Data' : 'Personalize Profile'}
            </motion.button>

            <button
              onClick={handleLogoutSession}
              className="w-full bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 py-5 rounded-[2.2rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-rose-500/20 shadow-lg shadow-rose-500/5"
            >
              <LogOut size={18} />
              Terminate Session
            </button>
          </div>
        </main>

        <footer className="py-8 text-center">
          <p className="text-[8px] text-gray-500 font-black tracking-[0.6em] uppercase opacity-40 italic">
            Secure Node: PX-992-026
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

// Sub-component for Info Tiles
const InfoTile = ({ icon, label, value, isEditing, onChange }) => (
  <div className="bg-[#1e1e1e]/60 p-5 rounded-[2.2rem] border border-white/5 flex items-center gap-5 group transition-all hover:border-[#F3C263]/30">
    <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center text-[#F3C263] border border-white/5 shadow-inner">
      {icon}
    </div>
    <div className="flex-grow">
      <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1 opacity-60">
        {label}
      </p>
      {isEditing ? (
        <input
          className="bg-transparent border-b border-[#F3C263]/30 outline-none text-sm w-full py-1 font-bold italic text-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="text-sm font-bold tracking-tight">{value}</p>
      )}
    </div>
  </div>
);

export default Profile;
