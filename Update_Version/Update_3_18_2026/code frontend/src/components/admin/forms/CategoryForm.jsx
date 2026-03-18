import React, { useEffect, useMemo, useState } from 'react';
import Switch from '../../admin/Switch';
import Select from '../../admin/Select';

export default function CategoryForm({ initial, modules, categories, defaultModuleId, onSubmit, onCancel, loading, existingNames = [] }) {
  const isEditing = !!initial?.id;
  const [title, setTitle] = useState(initial?.title || initial?.name || '');
  const [moduleId, setModuleId] = useState(String(initial?.module_id || defaultModuleId || ''));
  const [categoryType, setCategoryType] = useState(initial?.category_type || 'Work Area');
  const [parentId, setParentId] = useState(initial?.parent_id ? String(initial.parent_id) : '');
  const [orderIndex, setOrderIndex] = useState(initial?.order_index ?? initial?.order ?? initial?.sort_index ?? 0);
  const [active, setActive] = useState(!!(initial?.is_active ?? initial?.active ?? true));

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(initial?.title || initial?.name || '');
    setModuleId(String(initial?.module_id || defaultModuleId || ''));
    setCategoryType(initial?.category_type || 'Work Area');
    setParentId(initial?.parent_id ? String(initial.parent_id) : '');
    setOrderIndex(initial?.order_index ?? initial?.order ?? initial?.sort_index ?? 0);
    setActive(!!(initial?.is_active ?? initial?.active ?? true));
  }, [initial, defaultModuleId]);

  const dupNames = useMemo(() => new Set(existingNames.map((n) => (n || '').toLowerCase())), [existingNames]);

  const moduleOptions = useMemo(
    () => modules.map((m) => ({ value: String(m.id), label: m.title || m.name })),
    [modules]
  );

  const categoryTypeOptions = useMemo(
    () => [
      { value: 'Work Area', label: 'Work Area' },
      { value: 'Setting', label: 'Setting' },
      { value: 'Report', label: 'Report' },
    ],
    []
  );

  // Filter categories: same module + same type, max depth 2
  const parentOptions = useMemo(() => {
    if (!moduleId) return [];
    const filtered = (categories || []).filter(
      (c) =>
        String(c.module_id) === moduleId &&
        c.id !== initial?.id &&
        String(c.category_type || 'Work Area') === String(categoryType)
    );
    // Only allow root or level 1 categories as parents (max depth = 2)
    const allowed = filtered.filter((c) => {
      if (!c.parent_id) return true; // root level
      // Check if parent is root
      const parent = filtered.find((p) => p.id === c.parent_id);
      return parent && !parent.parent_id; // level 1
    });
    return [
      { value: '', label: '-- Root (No parent) --' },
      ...allowed.map((c) => ({
        value: String(c.id),
        label: c.parent_id ? `  ↳ ${c.title || c.name}` : c.title || c.name,
      })),
    ];
  }, [moduleId, categoryType, categories, initial]);

  useEffect(() => {
    if (!parentId) return;
    const isValidParent = parentOptions.some((opt) => opt.value === String(parentId));
    if (!isValidParent) setParentId('');
  }, [categoryType, moduleId, parentOptions, parentId]);

  const validate = () => {
    const e = {};
    const t = (title || '').trim();
    if (!t) e.title = 'Tiêu đề bắt buộc';
    else if (t.length < 3) e.title = 'Tối thiểu 3 ký tự';
    else if (t.length > 100) e.title = 'Tối đa 100 ký tự';
    
    // Uniqueness check
    const current = (initial?.title || initial?.name || '').toLowerCase();
    if (dupNames.has(t.toLowerCase()) && t.toLowerCase() !== current) {
      e.title = 'Tiêu đề đã tồn tại';
    }

    if (!moduleId) e.module_id = 'Module bắt buộc';
    if (!categoryType) e.category_type = 'Category type bắt buộc';

    if (isEditing) {
      const oi = Number(orderIndex);
      if (!Number.isInteger(oi) || oi < 0) e.order_index = 'Order phải là số nguyên ≥ 0';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit && onSubmit({
      title: title.trim(),
      module_id: String(moduleId),
      category_type: categoryType,
      parent_id: parentId ? Number(parentId) : null,
      is_active: !!active,
      ...(isEditing ? { order_index: Number(orderIndex) } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề <span className="text-red-500">*</span></label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập tiêu đề"
        />
        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Module <span className="text-red-500">*</span></label>
        <Select
          value={moduleId}
          onChange={setModuleId}
          options={moduleOptions}
          placeholder="Chọn module"
          error={errors.module_id}
          disabled={true}
        />
        {errors.module_id && <p className="text-xs text-red-600 mt-1">{errors.module_id}</p>}
        <p className="text-xs text-gray-500 mt-1">Module đã được chọn từ danh sách chính</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type <span className="text-red-500">*</span></label>
        <Select
          value={categoryType}
          onChange={setCategoryType}
          options={categoryTypeOptions}
          includePlaceholder={false}
          error={errors.category_type}
        />
        {errors.category_type && <p className="text-xs text-red-600 mt-1">{errors.category_type}</p>}
      </div>

      {moduleId && (
        <div>
          <label className="block text-sm font-medium mb-1">Parent Category</label>
          <Select
            value={parentId}
            onChange={setParentId}
            options={parentOptions}
            placeholder="Chọn parent (optional)"
          />
          <p className="text-xs text-gray-500 mt-1">Để trống nếu đây là category root. Parent phải cùng module và cùng category type.</p>
        </div>
      )}

      {isEditing && (
        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <input
            type="number"
            value={orderIndex}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (Number.isNaN(v)) setOrderIndex('');
              else setOrderIndex(Math.max(0, Math.trunc(v)));
            }}
            className={`w-40 border rounded px-3 py-2 ${errors.order_index ? 'border-red-500' : 'border-gray-300'}`}
            min={0}
            step={1}
            inputMode="numeric"
          />
          {errors.order_index && <p className="text-xs text-red-600 mt-1">{errors.order_index}</p>}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm">Kích hoạt</span>
        <Switch checked={active} onChange={setActive} />
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
          onClick={onCancel}
          disabled={loading}
        >
          Huỷ
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}
