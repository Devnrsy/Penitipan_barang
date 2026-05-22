import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Input from '../components/Input';
import Button from '../components/Button';
import logoImg from '../assets/box (4).png';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return Swal.fire({
        title: 'PENDAFTARAN GAGAL',
        text: 'Data akun tidak boleh kosong, Bre!',
        icon: 'error',
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#F3C263',
      });
    }

    setIsLoading(true);
    try {
      await register(email, password);
      Swal.fire({
        title: 'BERHASIL DAFTAR',
        text: 'Akun kamu sudah siap digunakan!',
        icon: 'success',
        background: '#1a1a1a',
        color: '#ffffff',
        iconColor: '#F3C263',
        showConfirmButton: false,
        timer: 1500,
      });
      navigate('/login');
    } catch (error) {
      Swal.fire({
        title: 'GAGAL',
        text: error.message || 'Terjadi kesalahan sistem!',
        icon: 'error',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- CONFIG ANIMASI (Mirroring Login ke arah Kiri) ---
  const deliveryVariants = {
    animate: {
      x: ['120%', '-120%'], // Berjalan dari Kanan ke Kiri
      rotateX: [15, 0, -15, 0],
      rotateY: [170, 180, 190, 180], // Tetap menghadap kiri (180deg)
      transition: { duration: 8, repeat: Infinity, ease: 'linear' },
    },
  };

  const truckShakeVariants = {
    animate: {
      y: [0, -4, -1, -5, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const boxTiltVariants = {
    animate: {
      rotate: [-3, 3, -1, 4, -3],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center relative overflow-hidden">
      {/* Glow Effect (Sedikit berbeda tone warnanya agar unik dibanding login) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[400px] bg-gradient-to-b from-[#F3C263]/15 via-[#F3C263]/5 to-transparent pointer-events-none blur-3xl opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full flex flex-col items-center p-6 sm:p-8 z-10"
      >
        {/* HEADER SECTION */}
        <div className="flex-none mt-12 mb-8 flex flex-col items-center w-full relative py-10 overflow-hidden [perspective:500px]">
          {/* Garis Jalan Putus-putus */}
          <div
            className="absolute bottom-28 left-0 w-full h-[1px] bg-white/10 z-0 opacity-35"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 33%, rgba(255,255,255,0) 0%)',
              backgroundPosition: 'bottom',
              backgroundSize: '12px 1px',
              backgroundRepeat: 'repeat-x',
            }}
          />

          <motion.div
            className="flex items-end gap-1 relative z-20"
            variants={deliveryVariants}
            animate="animate"
            style={{ rotateY: 180 }} // Truk di-flip agar menghadap kiri
          >
            <motion.div
              variants={truckShakeVariants}
              animate="animate"
              className="text-[#F3C263]"
            >
              <Truck
                size={85}
                strokeWidth={1.2}
                className="drop-shadow-[0_0_15px_rgba(243,194,99,0.4)]"
              />
            </motion.div>
            <motion.div
              variants={boxTiltVariants}
              animate="animate"
              className="w-18 h-18 -ml-4 mb-1 relative overflow-hidden rounded-lg"
            >
              <img
                src={logoImg}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          <div className="mt-6 text-center relative z-10">
            <h1 className="text-xl font-black tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 italic">
              Buat Akun
            </h1>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="flex-grow flex flex-col justify-center w-full max-w-[340px]">
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email Baru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                className="bg-white/[0.03] border-white/10 focus:border-[#F3C263]/50 transition-all py-4"
              />
              <Input
                type="password"
                placeholder="Password Baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                className="bg-white/[0.03] border-white/10 focus:border-[#F3C263]/50 transition-all py-4"
              />
            </div>

            <div className="flex justify-end items-center text-[10px] text-gray-500 px-2 uppercase tracking-widest font-black">
              <Link
                to="/login"
                className="text-[#F3C263]/80 hover:text-[#F3C263] transition-colors"
              >
                Sudah punya akun? Login
              </Link>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4.5 bg-[#F3C263] text-black font-black rounded-2xl shadow-[0_15px_30px_rgba(243,194,99,0.2)] uppercase tracking-widest text-xs"
              >
                {isLoading ? 'MENDAFTARKAN...' : 'DAFTAR SEKARANG'}
              </Button>
            </motion.div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex-none pb-6 mt-4">
          <p className="text-[8px] text-gray-600 tracking-[0.5em] uppercase font-black text-center opacity-50 italic">
            &copy; 2026 Inventory Logistics
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
