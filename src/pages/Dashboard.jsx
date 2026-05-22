/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  History,
  User,
  Plus,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import AddProductModal from '../components/AddProductModal';
import { useAuth } from '../hooks/useAuth';

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://skfxqiresyqugraqyqci.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZnhxaXJlc3lxdWdyYXF5cWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDQzNDIsImV4cCI6MjA5MzU4MDM0Mn0.fhw_t1g9yMEmdwxkISrPJGhVkOEBxcHWAum6SUP60nk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    masuk: 0,
    keluar: 0,
    persentase: 0,
  });

  const loadDashboardData = async () => {
    try {
      const { data: allHistory, error: historyError } = await supabase
        .from('history')
        .select('*');

      if (historyError) throw historyError;

      const sortedActivities = [...(allHistory || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentActivities(sortedActivities);

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*');

      if (inventoryError) throw inventoryError;

      const totalStok = (inventoryData || []).reduce((acc, curr) => {
        const jumlah = curr.STOK || curr.stok || curr.stock || 0;
        return acc + Number(jumlah);
      }, 0);

      const totalMasuk = (allHistory || []).filter((i) => {
        const tipeTrans = (i.tipe || i.status || 'masuk').toLowerCase();
        return tipeTrans === 'masuk';
      }).length;

      const totalKeluar = (allHistory || []).filter((i) => {
        const tipeTrans = (i.tipe || i.status || '').toLowerCase();
        return tipeTrans === 'keluar';
      }).length;

      const maxKapasitas = 500;
      setStats({
        total: totalStok,
        masuk: totalMasuk,
        keluar: totalKeluar,
        persentase: Math.min((totalStok / maxKapasitas) * 100, 100),
      });
    } catch (error) {
      console.error('Error fetching data dari Supabase:', error.message);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCloseModal = (success = false) => {
    setIsModalOpen(false);
    if (success === true) {
      loadDashboardData();
      Swal.fire({
        icon: 'success',
        title: 'DATA TERSIMPAN',
        text: 'Barang berhasil dicatat ke dalam sistem Supabase.',
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#F3C263',
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: 'rounded-[2rem] border border-white/10' },
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] flex flex-col relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-gradient-to-b from-[#F3C263]/10 to-transparent pointer-events-none z-0" />

      <AddProductModal isOpen={isModalOpen} onClose={handleCloseModal} />

      <header className="flex-none p-6 pt-14 pb-2 flex justify-between items-center z-20 relative">
        <div className="space-y-1">
          <p className="text-[10px] text-[#F3C263] font-black tracking-[0.2em] uppercase leading-none">
            {user?.email
              ? `ID: ${user.email.split('@')[0]}`
              : 'LOGISTICS SYSTEM'}
          </p>
          <h1 className="text-xl font-bold italic leading-none mt-4">
            Halo, Bro! 👋
          </h1>
        </div>
        <div
          onClick={() => navigate('/profile')}
          className="w-10 h-10 bg-[#222] rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:border-[#F3C263]/50 transition-all active:scale-90"
        >
          <User size={20} className="text-[#F3C263]" />
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-6 pb-32 no-scrollbar z-10 mt-2">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            onClick={() => navigate('/inventory')}
            className="col-span-2 bg-[#222] p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
          >
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
              Kapasitas Gudang
            </p>
            <h3 className="text-4xl font-black mb-4 italic leading-none">
              {stats.total}{' '}
              <span className="text-sm font-medium text-gray-500 not-italic">
                Barang
              </span>
            </h3>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.persentase}%` }}
                className="bg-gradient-to-r from-[#F3C263] to-[#e2b152] h-full rounded-full"
              />
            </div>
          </div>

          <div
            onClick={() => navigate('/inventory')}
            className="cursor-pointer active:scale-95 transition-transform w-full"
          >
            <StatSmallCard
              icon={PackagePlus}
              color="emerald"
              label="Masuk"
              value={stats.masuk}
            />
          </div>

          <div
            onClick={() => navigate('/pengambilan')}
            className="cursor-pointer active:scale-95 transition-transform w-full"
          >
            <StatSmallCard
              icon={PackageMinus}
              color="rose"
              label="Keluar"
              value={stats.keluar}
            />
          </div>
        </div>

        <section>
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              Aktivitas Terakhir
            </h3>
            <Plus
              onClick={() => navigate('/pengambilan')}
              className="text-[#F3C263] cursor-pointer hover:scale-110 active:scale-90 transition-transform"
              size={18}
            />
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((item, idx) => (
                <ActivityTile key={item.id || idx} item={item} />
              ))
            ) : (
              <div className="text-center py-10 opacity-30 italic text-sm">
                Belum ada aktivitas di database...
              </div>
            )}
          </div>
        </section>
      </main>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[88%] z-30">
        <nav className="bg-[#222]/90 backdrop-blur-2xl border border-white/10 h-16 rounded-[2rem] flex justify-around items-center px-4 shadow-2xl">
          <TabItem
            icon={LayoutDashboard}
            active={location.pathname === '/'}
            onClick={() => navigate('/')}
          />
          <TabItem
            icon={Package}
            active={location.pathname === '/inventory'}
            onClick={() => navigate('/inventory')}
          />
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-[#F3C263] rounded-full flex items-center justify-center text-black -translate-y-4 active:scale-90 transition-all cursor-pointer shadow-lg shadow-yellow-600/20"
          >
            <Plus size={24} strokeWidth={3} />
          </div>
          <TabItem
            icon={History}
            active={location.pathname === '/history'}
            onClick={() => navigate('/history')}
          />
          <TabItem
            icon={PackageMinus}
            active={location.pathname === '/pengambilan'}
            onClick={() => navigate('/pengambilan')}
          />
        </nav>
      </div>
    </div>
  );
};

const StatSmallCard = ({ icon: Icon, color, label, value }) => (
  <div className="bg-[#222] p-5 rounded-[2rem] border border-white/5 flex flex-col justify-between aspect-square w-full">
    <div
      className={`w-10 h-10 ${color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} rounded-xl flex items-center justify-center`}
    >
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1 leading-none">
        {label}
      </p>
      <h3
        className={`text-2xl font-black ${color === 'emerald' ? 'text-emerald-400' : 'text-rose-400'} mt-1 leading-none`}
      >
        {color === 'emerald' ? '+' : '-'}
        {value}
      </h3>
    </div>
  </div>
);

const ActivityTile = ({ item }) => {
  const formatTime = (isoString) => {
    if (!isoString) return '00.00';
    const date = new Date(isoString);
    return date
      .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      .replace(':', '.');
  };

  const currentType = (item.tipe || item.status || 'masuk').toLowerCase();

  return (
    <div className="bg-[#222]/60 p-4 rounded-[1.5rem] border border-white/5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-[#F3C263]/50">
          {currentType === 'keluar' ? (
            <PackageMinus size={18} />
          ) : (
            <Package size={18} />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-200 leading-none">
            {item.nama_barang || item.namaBarang || 'Barang'}
          </p>
          <p className="text-[10px] text-gray-600 font-medium mt-1">
            {formatTime(item.created_at)} •{' '}
            {currentType === 'keluar' ? 'Keluar' : 'Masuk'}
          </p>
        </div>
      </div>
      <span
        className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${
          currentType === 'keluar'
            ? 'text-rose-500 border-rose-500/10 bg-rose-500/5'
            : 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5'
        }`}
      >
        {currentType}
      </span>
    </div>
  );
};

const TabItem = ({ icon: Icon, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`p-2 transition-all duration-300 active:scale-125 transform ${
      active ? 'text-[#F3C263] scale-110' : 'text-gray-600 hover:text-[#F3C263]'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 3 : 2} />
  </button>
);

export default Dashboard;
