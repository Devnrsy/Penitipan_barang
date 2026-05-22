/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  History as HistoryIcon,
  LogOut,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Gagal mengambil data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- LOGIKA STATISTIK ---
  const stats = {
    stokMasuk: transactions
      .filter((t) => (t.tipe || '').toLowerCase() === 'masuk')
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0),
    stokKeluar: transactions
      .filter((t) => (t.tipe || '').toLowerCase() === 'keluar')
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0),
    uangMasuk: transactions
      .filter((t) => (t.tipe || '').toLowerCase() === 'masuk')
      .reduce((acc, curr) => acc + Number(curr.total_harga || 0), 0),
    uangKeluar: transactions
      .filter((t) => (t.tipe || '').toLowerCase() === 'keluar')
      .reduce((acc, curr) => acc + Number(curr.total_harga || 0), 0),
  };

  const saldoGudang = stats.uangMasuk - stats.uangKeluar;

  // --- FILTERING ---
  const filteredTransactions = transactions.filter((item) => {
    const nama = (item.nama_barang || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const tipe = (item.tipe || '').toLowerCase();
    const matchesSearch = nama.includes(search);
    const matchesTab =
      activeTab === 'Semua' ||
      (activeTab === 'Masuk' && tipe === 'masuk') ||
      (activeTab === 'Keluar' && tipe === 'keluar');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="w-full h-full bg-[#1a1a1a] flex flex-col relative overflow-hidden text-white">
      <div className="w-full max-w-[430px] h-screen sm:h-[92vh] sm:rounded-[3rem] bg-[#1a1a1a] flex flex-col relative overflow-hidden text-white shadow-2xl mx-auto">
        <header className="p-6 pt-12 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-11 h-11 bg-[#222] rounded-2xl flex items-center justify-center border border-white/5 active:scale-90 transition-all"
            >
              <ArrowLeft size={20} className="text-[#F3C263]" />
            </button>
            <div>
              <h1 className="text-xl font-bold italic tracking-tight">
                Riwayat
              </h1>
              <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">
                Aktivitas Gudang
              </p>
            </div>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto px-6 pb-40 no-scrollbar z-10">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-xs text-gray-500">
              MEMUAT DATA...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#222]/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1">
                    Stok Masuk
                  </p>
                  <h3 className="text-sm font-bold text-emerald-400">
                    {stats.stokMasuk}{' '}
                    <span className="text-[10px] opacity-60">Unit</span>
                  </h3>
                </div>
                <div className="bg-[#222]/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1">
                    Stok Keluar
                  </p>
                  <h3 className="text-sm font-bold text-rose-400">
                    {stats.stokKeluar}{' '}
                    <span className="text-[10px] opacity-60">Unit</span>
                  </h3>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  placeholder="Cari riwayat..."
                  className="w-full bg-[#222] border border-white/5 rounded-[1.2rem] py-4 px-6 text-sm focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex bg-black/20 p-1.5 rounded-[1.3rem] border border-white/5">
                  {['Semua', 'Masuk', 'Keluar'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${
                        activeTab === tab
                          ? 'bg-[#F3C263] text-black shadow-lg'
                          : 'text-gray-500'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((item) => (
                    <motion.div
                      key={item.id}
                      className="bg-[#222]/40 backdrop-blur-sm p-4 rounded-[1.8rem] border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold">
                          {item.nama_barang}
                        </h4>
                        <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase">
                          {item.jumlah} Unit
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-black ${item.tipe?.toLowerCase() === 'keluar' ? 'text-rose-500' : 'text-emerald-500'}`}
                        >
                          {item.tipe?.toLowerCase() === 'keluar' ? '-' : '+'} Rp{' '}
                          {Number(item.total_harga || 0).toLocaleString(
                            'id-ID'
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-12 bg-gradient-to-br from-[#F3C263] to-[#e2b152] p-8 rounded-[3rem] text-black text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">
                  Total Saldo Gudang
                </p>
                <h2 className="text-3xl font-black italic">
                  Rp {saldoGudang.toLocaleString('id-ID')}
                </h2>
              </div>
            </>
          )}
        </main>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] z-30">
          <nav className="bg-[#222]/80 backdrop-blur-2xl border border-white/10 h-18 rounded-[2.5rem] flex justify-around items-center px-4 shadow-2xl">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 text-gray-600"
            >
              <LayoutDashboard size={22} />
            </button>
            <button
              onClick={() => navigate('/inventory')}
              className="p-3 text-gray-600"
            >
              <Package size={22} />
            </button>
            <div className="w-14 h-14 bg-[#F3C263] rounded-full flex items-center justify-center -translate-y-5 shadow-lg border-4 border-[#F3C263]">
              <Plus size={28} className="text-black" strokeWidth={3} />
            </div>
            <div className="p-3 text-[#F3C263] bg-[#F3C263]/10 rounded-2xl">
              <HistoryIcon size={22} />
            </div>
            <button onClick={() => navigate('/')} className="p-3 text-gray-600">
              <LogOut size={22} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default History;
