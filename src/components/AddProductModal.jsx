/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabase';

const AddProductModal = ({ isOpen, onClose, editData, onRefresh }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [stock, setStock] = useState('');
  const [owner, setOwner] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.nama_barang || editData.name || '');
      setCategory(editData.kategori || editData.category || 'Elektronik');
      setStock(
        editData.stok !== undefined ? editData.stok : editData.stock || ''
      );
      setOwner(editData.owner || '');
      setPrice(editData.harga || editData.price || '');
    } else {
      setName('');
      setCategory('Elektronik');
      setStock('');
      setOwner('');
      setPrice('');
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !stock || !owner || !price) {
      Swal.fire({
        icon: 'error',
        title: 'Kurang Lengkap, Bre!',
        text: 'Nama, Stok, Pemilik, dan Biaya wajib diisi ya.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#F3C263',
      });
      return;
    }

    setIsLoading(true);

    try {
      const parsedStock = parseInt(stock);
      const parsedPrice = parseFloat(price);
      // PERBAIKAN: Hitung total harga di sini agar data riwayat tidak 0
      const calculatedTotal = parsedStock * parsedPrice;

      if (editData) {
        const { error: updateError } = await supabase
          .from('inventory')
          .update({
            nama_barang: name,
            kategori: category,
            owner: owner,
            harga: parsedPrice,
            stok: parsedStock,
          })
          .eq('id', editData.id);

        if (updateError) throw updateError;

        Swal.fire({
          title: 'Berhasil Diperbarui!',
          icon: 'success',
          background: '#1a1a1a',
          color: '#fff',
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('inventory')
          .insert([
            {
              nama_barang: name,
              kategori: category,
              owner: owner,
              harga: parsedPrice,
              stok: parsedStock,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // --- LOG OTOMATIS KE TABLE HISTORY ---
        const { error: historyError } = await supabase.from('history').insert([
          {
            barang_id: newProduct.id,
            nama_barang: newProduct.nama_barang,
            tipe: 'MASUK',
            jumlah: parsedStock,
            total_harga: calculatedTotal, // <--- Data sudah terisi sekarang
          },
        ]);

        if (historyError) throw historyError;

        Swal.fire({
          title: 'Berhasil Disimpan!',
          icon: 'success',
          background: '#1a1a1a',
          color: '#fff',
          showConfirmButton: false,
          timer: 1000,
        });
      }

      if (onRefresh) onRefresh();
      onClose(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan!',
        text: error.message,
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#F3C263',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[430px] bg-[#1a1a1a] border-t border-white/10 rounded-t-[3rem] p-8 pb-12 overflow-y-auto max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">
                {editData ? 'Edit Barang' : 'Tambah Barang'}
              </h2>
              <button
                onClick={() => onClose(false)}
                className="p-2 bg-white/5 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#222] border border-white/5 rounded-2xl py-4 px-6 mt-2 text-white focus:outline-none"
                  placeholder="Nama barang..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                  Nama Pemilik
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-[#222] border border-white/5 rounded-2xl py-4 px-6 mt-2 text-white focus:outline-none"
                  placeholder="Pemilik..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#222] border border-white/5 rounded-2xl py-4 px-6 mt-2 text-white focus:outline-none appearance-none"
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Aksesoris">Aksesoris</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-[#222] border border-white/5 rounded-2xl py-4 px-6 mt-2 text-white focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                  Biaya (Rp)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#222] border border-white/5 rounded-2xl py-4 px-6 mt-2 text-white focus:outline-none"
                  placeholder="Nominal..."
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-[#F3C263] text-black font-black rounded-2xl mt-4 hover:bg-[#e2b152] transition-all uppercase text-xs tracking-[0.2em]"
              >
                {isLoading
                  ? 'MEMPROSES...'
                  : editData
                    ? 'Simpan Perubahan'
                    : 'Simpan Barang'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;
