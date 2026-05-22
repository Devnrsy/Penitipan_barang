/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // <--- 1. IMPOR PORTAL
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Package,
  MoreVertical,
  LayoutDashboard,
  History,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddProductModal from '../components/AddProductModal';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabase';

// <--- 2. KOMPONEN PORTAL MENU (DITARUH DI LUAR HIERARKI UTAMA)
const ProductMenuPortal = ({
  isOpen,
  onClose,
  anchorRect,
  onEdit,
  onDelete,
  itemName,
}) => {
  if (!isOpen || !anchorRect) return null;

  // Hitung posisi menu agar pas di sebelah tombol
  const menuPosition = {
    top: anchorRect.top + anchorRect.height + window.scrollY + 8,
    left: anchorRect.left + anchorRect.width + window.scrollX - 128, // 128 adalah lebar w-32
  };

  // Render menu di 'document.body'
  return createPortal(
    <>
      {/* Backdrop transparan penuh layar */}
      <div
        className="fixed inset-0 z-[99998] bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Kontainer Menu yang posisinya fixed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 5 }}
        style={{
          position: 'fixed',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
        }}
        className="w-32 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-[99999] p-1.5"
      >
        <button
          onClick={onEdit}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs hover:bg-white/5 rounded-xl transition-colors text-gray-300"
        >
          <Edit3 size={14} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors"
        >
          <Trash2 size={14} /> Hapus
        </button>
      </motion.div>
    </>,
    document.body // <--- TEMPAT MERENDER
  );
};

const Inventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // <--- 3. STATE BARU UNTUK PORTAL
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuAnchorRect, setMenuAnchorRect] = useState(null);

  const categories = ['Semua', 'Elektronik', 'Fashion', 'Aksesoris'];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Gagal mengambil data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item) => {
    setProductToEdit(item);
    setIsModalOpen(true);
    setOpenMenuId(null);
    setMenuAnchorRect(null); // Tutup portal
  };

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    setProductToEdit(null);
    if (refresh === true) loadData();
  };

  // <--- 4. FUNGSI UNTUK MEMBUKA MENU DENGAN PORTAL
  const handleOpenMenu = (e, itemId) => {
    e.stopPropagation(); // Stop bubbling ke item list
    const rect = e.currentTarget.getBoundingClientRect(); // Ambil posisi tombol
    setMenuAnchorRect(rect);
    setOpenMenuId(itemId);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
    setMenuAnchorRect(null);
  };

  const handleDelete = (id, name) => {
    handleCloseMenu(); // Tutup portal
    Swal.fire({
      title: 'Yakin mau hapus?',
      text: `${name} bakal hilang dari gudang, Bre!`,
      icon: 'warning',
      showCancelButton: true,
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', id);
          if (error) throw error;
          loadData();
          Swal.fire({
            title: 'Terhapus!',
            icon: 'success',
            background: '#1a1a1a',
            color: '#fff',
            showConfirmButton: false,
            timer: 1000,
          });
        } catch (error) {
          Swal.fire('GAGAL', error.message, 'error');
        }
      }
    });
  };

  const filteredProducts = products.filter((item) => {
    const namaBarang = item.nama_barang || '';
    const matchesSearch = namaBarang
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === 'Semua' ||
      (item.kategori &&
        item.kategori.toLowerCase() === activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full h-full bg-[#1a1a1a] flex flex-col relative overflow-hidden text-white">
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={productToEdit}
        onRefresh={loadData}
      />

      {/* <--- 5. RENDER PORTAL MENU DI SINI (LOKASI TIDAK PENTING KARENA AKAN DI-PORTAL KE BODY) */}
      <AnimatePresence>
        {openMenuId && (
          <ProductMenuPortal
            isOpen={!!openMenuId}
            onClose={handleCloseMenu}
            anchorRect={menuAnchorRect}
            itemName={products.find((p) => p.id === openMenuId)?.nama_barang}
            onEdit={() => handleEdit(products.find((p) => p.id === openMenuId))}
            onDelete={() =>
              handleDelete(
                openMenuId,
                products.find((p) => p.id === openMenuId)?.nama_barang
              )
            }
          />
        )}
      </AnimatePresence>

      <header className="flex-none p-6 pt-10 flex items-center justify-between z-20 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-11 h-11 bg-[#222] rounded-2xl flex items-center justify-center border border-white/5 active:scale-90"
          >
            <ArrowLeft size={20} className="text-[#F3C263]" />
          </button>
          <div>
            <h1 className="text-xl font-bold italic tracking-tight">
              Inventory
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
              {isLoading ? '...' : `${filteredProducts.length} items`}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-none p-6 pb-4 flex gap-3 z-20">
        <div className="relative flex-grow">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari barang..."
            className="w-full bg-[#222] border border-white/5 rounded-[1.2rem] py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#F3C263]/30 transition-all uppercase tracking-wider font-bold placeholder-gray-600 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterOpen(!isFilterOpen);
            }}
            className={`w-12 h-[52px] rounded-[1.2rem] flex items-center justify-center transition-all border ${activeCategory !== 'Semua' ? 'bg-[#F3C263] text-black border-[#F3C263]' : 'bg-[#222] text-gray-400 border-white/5'}`}
          >
            <Filter size={20} />
          </button>
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-48 bg-[#222] border border-white/10 rounded-2xl shadow-2xl z-[100] p-2 backdrop-blur-xl"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs mb-1 transition-all ${activeCategory === cat ? 'bg-[#F3C263] text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                    {cat}
                    {activeCategory === cat && <Check size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overflow-y-auto di sini yang sering memotong z-index */}
      <main
        className="flex-grow overflow-y-auto px-6 pb-32 no-scrollbar z-10 space-y-4"
        onClick={() => {
          setIsFilterOpen(false);
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-xs font-black tracking-widest text-gray-500 uppercase animate-pulse">
            Sinkronisasi Database...
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <motion.div
              key={item.id}
              layout
              style={{ overflow: 'visible' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#222]/40 backdrop-blur-sm p-4 rounded-[1.8rem] border border-white/5 flex items-center justify-between relative group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-[#F3C263]">
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-100 uppercase">
                    {item.nama_barang}
                  </h4>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
                    {item.kategori} • Baru
                  </p>
                  <p className="text-[11px] text-emerald-500 font-bold mt-1">
                    Rp {Number(item.harga || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-[8px] text-gray-600 uppercase font-black">
                    STOK
                  </p>
                  <p className="text-lg font-black text-[#F3C263] leading-none">
                    {item.stok}
                  </p>
                </div>

                {/* MENU EDIT / HAPUS (SEKARANG MENGGUNAKAN PORTAL) */}
                <div className="relative">
                  <button
                    onClick={(e) => handleOpenMenu(e, item.id)} // <--- PANGGILhandleOpenMenu
                    className="p-2 hover:bg-white/5 rounded-xl"
                  >
                    <MoreVertical size={18} className="text-gray-600" />
                  </button>
                  {/* Kode AnimatePresence lama di sini SUDAH DIHAPUS */}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 opacity-25">
            <Package size={60} strokeWidth={1} className="text-gray-600" />
            <p className="text-[10px] uppercase tracking-[0.3em] font-black mt-4 text-gray-500">
              Gudang Kosong
            </p>
          </div>
        )}
      </main>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] z-30">
        <nav className="bg-[#222]/80 backdrop-blur-2xl border border-white/10 h-18 rounded-[2.5rem] flex justify-around items-center px-4 shadow-2xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 text-gray-600 active:scale-90 transition-all"
          >
            <LayoutDashboard size={22} />
          </button>
          <div className="p-3 text-[#F3C263] bg-[#F3C263]/10 rounded-2xl">
            <Package size={22} strokeWidth={3} />
          </div>
          <div
            onClick={handleOpenAddModal}
            className="w-14 h-14 bg-[#F3C263] rounded-full flex items-center justify-center text-black shadow-lg -translate-y-5 active:scale-90 transition-all cursor-pointer border-4 border-[#F3C263]"
          >
            <Plus size={28} strokeWidth={3} />
          </div>
          <button
            onClick={() => navigate('/history')}
            className="p-3 text-gray-600 active:scale-90 transition-all"
          >
            <History size={22} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="p-3 text-gray-600 hover:text-rose-500 active:scale-90 transition-all"
          >
            <LogOut size={22} />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Inventory;
