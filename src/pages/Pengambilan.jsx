/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PackageMinus,
  ChevronDown,
  Database,
  Box,
  Fingerprint,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabase';

const Pengambilan = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    idBarang: '',
    jumlah: '',
    peminjam: '',
  });

  // 1. READ: AMBIL DAFTAR BARANG
  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('nama_barang', { ascending: true });

      if (error) throw error;

      // Deteksi dinamis isi kolom stok
      const readyProducts = (data || []).filter((p) => {
        const currentStock = p.STOK || p.stok || p.stock || 0;
        return Number(currentStock) > 0;
      });

      setProducts(readyProducts);
    } catch (error) {
      console.error('Gagal memuat produk:', error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. FUNGSI PILIH BARANG
  const handleSelectProduct = (e) => {
    const id = e.target.value;
    const product = products.find((p) => String(p.id) === String(id));

    if (product) {
      setSelectedProduct(product);
      setFormData({ ...formData, idBarang: id });
    } else {
      setSelectedProduct(null);
      setFormData({ ...formData, idBarang: '' });
    }
  };

  // 3. FUNGSI SIMPAN (POTONG STOK & CATAT LOG SEBENARNYA)
  const handleSimpan = async (e) => {
    e.preventDefault();

    if (!formData.idBarang || !formData.jumlah || !formData.peminjam) {
      return Swal.fire({
        icon: 'error',
        title: 'DATA TIDAK LENGKAP',
        text: 'Tentukan barang dan isi nama pengambil, Bre!',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#F3C263',
      });
    }

    const jmlAmbil = Number(formData.jumlah);
    if (jmlAmbil <= 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'JUMLAH SALAH',
        text: 'Jumlah pengambilan minimal 1 barang, Bre!',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#F3C263',
      });
    }

    if (!selectedProduct) return;

    const stokSekarang = Number(
      selectedProduct.STOK || selectedProduct.stok || selectedProduct.stock || 0
    );

    if (jmlAmbil > stokSekarang) {
      return Swal.fire({
        icon: 'warning',
        title: 'STOK KURANG!',
        text: `Sisa stok cuma ada ${stokSekarang} unit`,
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#F3C263',
      });
    }

    setIsLoading(true);

    try {
      const stokBaru = stokSekarang - jmlAmbil;
      const kolomStokYangDipakai = 'STOK' in selectedProduct ? 'STOK' : 'stok';

      // A. UPDATE: POTONG STOK DI TABEL INVENTORY
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ [kolomStokYangDipakai]: stokBaru })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // B. INSERT FIXED: Dikembalikan menembak kolom 'tipe' dengan value 'KELUAR' sesuai skema asli database kamu
      const { error: historyError } = await supabase.from('history').insert([
        {
          barang_id: selectedProduct.id,
          nama_barang: selectedProduct.nama_barang,
          tipe: 'KELUAR',
          jumlah: jmlAmbil,
          nama_penerima: formData.peminjam,
        },
      ]);

      if (historyError) throw historyError;

      Swal.fire({
        icon: 'success',
        title: 'BERHASIL DIAMBIL',
        text: 'Stok otomatis terpotong dari gudang!',
        background: '#1a1a1a',
        color: '#fff',
        showConfirmButton: false,
        timer: 1500,
      });

      navigate('/');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'GAGAL TRANSAKSI',
        text: error.message || 'Terjadi kesalahan sistem database.',
        background: '#1a1a1a',
        color: '#fff',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] flex flex-col relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-[250px] bg-gradient-to-b from-[#F3C263]/10 to-transparent pointer-events-none z-0" />

      <header className="flex-none p-8 pt-12 flex items-center gap-5 z-10 border-b border-white/5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-11 h-11 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center border border-white/5 transition-all active:scale-90"
        >
          <ArrowLeft size={20} className="text-[#F3C263]" />
        </button>
        <div>
          <h1 className="text-xl font-bold italic tracking-tighter uppercase leading-none">
            Pengambilan
          </h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">
            Outbound System
          </p>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-8 pb-10 no-scrollbar z-10">
        <form onSubmit={handleSimpan} className="space-y-7 mt-6">
          <div className="space-y-3">
            <label className="text-[10px] text-[#F3C263] uppercase font-black tracking-[0.2em] ml-1 flex items-center gap-2">
              <Database size={12} /> Pilih Barang
            </label>
            <div className="relative group">
              <select
                className="w-full bg-white/5 border border-white/5 p-5 rounded-[1.5rem] outline-none focus:border-[#F3C263]/50 appearance-none text-sm font-bold transition-all cursor-pointer group-hover:bg-white/10 text-white"
                value={formData.idBarang}
                onChange={handleSelectProduct}
              >
                <option value="" className="bg-[#1a1a1a]">
                  -- Pilih Barang di Gudang --
                </option>
                {products.map((p) => {
                  const stokItem = p.STOK || p.stok || p.stock || 0;
                  return (
                    <option key={p.id} value={p.id} className="bg-[#1a1a1a]">
                      {p.nama_barang} ({stokItem})
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity pointer-events-none"
                size={20}
              />
            </div>
          </div>

          <AnimatePresence>
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-[2rem] p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Box size={80} />
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                      Pemilik
                    </p>
                    <p className="text-sm font-bold text-[#F3C263] italic uppercase truncate">
                      {selectedProduct.owner || 'TIDAK ADA'}
                    </p>
                  </div>
                  <div className="space-y-1 border-l border-white/5 pl-4">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                      Sisa Stok
                    </p>
                    <p className="text-sm font-bold text-emerald-400">
                      {selectedProduct.STOK ||
                        selectedProduct.stok ||
                        selectedProduct.stock ||
                        0}{' '}
                      <span className="text-[10px] opacity-50 uppercase">
                        Unit
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] ml-1">
                Jumlah Ambil
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-[1.5rem] outline-none focus:border-[#F3C263]/50 text-sm font-bold text-white"
                  placeholder="0"
                  value={formData.jumlah}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah: e.target.value })
                  }
                />
                <Box
                  className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] ml-1">
                Nama Pengambil
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/5 p-5 rounded-[1.5rem] outline-none focus:border-[#F3C263]/50 text-sm font-bold text-white"
                  placeholder="Contoh: Santoso"
                  value={formData.peminjam}
                  onChange={(e) =>
                    setFormData({ ...formData, peminjam: e.target.value })
                  }
                />
                <Fingerprint
                  className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F3C263] text-black font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 shadow-xl shadow-yellow-600/5 mt-4 group disabled:opacity-50"
          >
            <PackageMinus
              size={20}
              strokeWidth={3}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="uppercase tracking-widest text-[11px]">
              {isLoading ? 'MEMPROSES...' : 'Konfirmasi Pengambilan'}
            </span>
          </motion.button>
        </form>
      </main>

      <footer className="flex-none py-6 text-center opacity-20">
        <p className="text-[8px] font-black tracking-[0.5em] uppercase">
          Secure Outbound Log v1.0
        </p>
      </footer>
    </div>
  );
};

export default Pengambilan;
