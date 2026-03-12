import React, { useEffect, useMemo, useState } from 'react';
import Switch from '../../admin/Switch';
import IconPicker from '../../admin/IconPicker';

export default function ModuleForm({ initial, onSubmit, onCancel, loading, existingNames = [] }) {
  const [name, setName] = useState(initial?.name || initial?.title || '');
  const [icon, setIcon] = useState(initial?.icon || '');
  const [orderIndex, setOrderIndex] = useState(
    initial?.order_index ?? initial?.order ?? initial?.sort_index ?? 0
  );
  const [active, setActive] = useState(!!(initial?.is_active ?? initial?.active));

  const [errors, setErrors] = useState({});
  const [openPicker, setOpenPicker] = useState(false);

  useEffect(() => {
    setName(initial?.name || initial?.title || '');
    setIcon(initial?.icon || '');
    setOrderIndex(initial?.order_index ?? initial?.order ?? initial?.sort_index ?? 0);
    setActive(!!(initial?.is_active ?? initial?.active));
  }, [initial]);

  const dupNames = useMemo(() => new Set(existingNames.map((n) => (n || '').toLowerCase())), [existingNames]);

  const validate = () => {
    const e = {};
    const nm = (name || '').trim();
    if (!nm) e.name = 'Tên bắt buộc';
    else if (nm.length < 3) e.name = 'Tối thiểu 3 ký tự';
    else if (nm.length > 60) e.name = 'Tối đa 60 ký tự';
    // Uniqueness (client side best-effort)
    const current = (initial?.name || initial?.title || '').toLowerCase();
    if (dupNames.has(nm.toLowerCase()) && nm.toLowerCase() !== current) e.name = 'Tên đã tồn tại';

    const oi = Number(orderIndex);
    if (!Number.isInteger(oi) || oi < 0) e.order_index = 'Order phải là số nguyên ≥ 0';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit && onSubmit({ name: name.trim(), icon: icon?.trim(), order_index: Number(orderIndex), is_active: !!active });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tên module</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nhập tên" />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Icon (Font Awesome class)</label>
        <div className="flex items-center gap-2">
          <input value={icon} onChange={(e)=>setIcon(e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 font-mono" placeholder="fas fa-truck" />
          <button type="button" className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50" onClick={()=>setOpenPicker(true)}>Chọn icon</button>
          <div className="w-8 h-8 flex items-center justify-center rounded border bg-white">
            {icon && icon.includes('fa-') ? (
              <i className={`${icon.replace('fas','fa-solid')} text-lg`}></i>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Ví dụ: <span className="font-mono">fas fa-truck</span>. Bạn có thể dán class hoặc bấm “Chọn icon”.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Order</label>
        <input type="number" value={orderIndex} onChange={(e)=>setOrderIndex(e.target.value)} className={`w-40 border rounded px-3 py-2 ${errors.order_index ? 'border-red-500' : 'border-gray-300'}`} min={0} />
        {errors.order_index && <p className="text-xs text-red-600 mt-1">{errors.order_index}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">Kích hoạt</span>
        <Switch checked={active} onChange={setActive} />
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        <button type="button" className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50" onClick={onCancel} disabled={loading}>Huỷ</button>
        <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
      </div>

      <IconPicker
        open={openPicker}
        value={icon}
        onSelect={(cls) => { setIcon(cls); setOpenPicker(false); }}
        onClose={() => setOpenPicker(false)}
      />
    </form>
  );
}
