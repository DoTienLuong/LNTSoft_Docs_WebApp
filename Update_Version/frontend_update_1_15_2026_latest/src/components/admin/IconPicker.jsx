import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';

const FALLBACK = [
  'square','circle','check','xmark','plus','minus','user','users','user-plus','user-gear','user-tie','lock','unlock','key','cog','gears','gear','trash','pen','pen-to-square','edit','download','upload','arrow-right','arrow-left','arrow-up','arrow-down','angles-right','angles-left','angles-up','angles-down','chevron-right','chevron-left','chevron-up','chevron-down','ellipsis','ellipsis-vertical','magnifying-glass','filter','sliders','home','house','building','warehouse','truck','car','cart-shopping','box','boxes-stacked','clipboard','clipboard-list','file','file-lines','file-pen','table','list','list-check','tags','tag','bookmark','calendar','calendar-days','clock','hourglass','bolt','bug','chart-line','chart-pie','chart-column','diagram-project','database','globe','sitemap','envelope','phone','comments','comment','info','question','exclamation','warning','bell','play','pause','stop','note-sticky','image','images','camera','heart','star','thumbs-up','thumbs-down'
];

export default function IconPicker({ open, value, onSelect, onClose }) {
  const [icons, setIcons] = useState(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://unpkg.com/@fortawesome/fontawesome-free@6.5.1/metadata/icons.json', { mode: 'cors' });
        const data = await res.json();
        if (cancelled) return;
        const names = Object.keys(data).filter((name) => {
          const meta = data[name];
          const styles = meta?.styles || [];
          return styles.includes('solid');
        });
        if (names?.length) setIcons(names.sort());
      } catch (e) {
        // fallback stays
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return icons;
    return icons.filter((n) => n.toLowerCase().includes(qq));
  }, [icons, q]);

  return (
    <Modal open={open} title="Chọn Icon (Font Awesome Solid)" onClose={onClose} maxWidth="max-w-4xl">
      <div className="mb-3 flex items-center gap-3">
        <div className="relative w-full">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Tìm icon..." className="w-full border border-gray-300 rounded px-3 py-2 pl-9" />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        {value ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Đang chọn:</span>
            <i className={`fa-solid ${value.includes('fa-') ? value.split(' ').find(c=>c.startsWith('fa-')) : ''} text-lg`}></i>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{value}</span>
          </div>
        ) : null}
      </div>
      <div className="min-h-[240px] max-h-[480px] overflow-auto border rounded p-2">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Đang tải danh sách icon...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filtered.map((name) => (
              <button key={name} type="button" onClick={() => onSelect && onSelect(`fas fa-${name}`)} className="flex flex-col items-center justify-center gap-2 p-3 rounded border hover:bg-gray-50">
                <i className={`fa-solid fa-${name} text-2xl`}></i>
                <span className="text-xs truncate w-full text-gray-700">{name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-end">
        <button className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  );
}
