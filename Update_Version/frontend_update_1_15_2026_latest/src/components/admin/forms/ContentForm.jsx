import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditorCK4 from '../../admin/EditorCK4';
import Switch from '../../admin/Switch';
import { convertService } from '../../../services/convertService';

export default function ContentForm({
  initial,
  moduleId,
  moduleName = '',
  categoryId,
  categoryName = '',
  contentsInCategory = [],
  onSubmit,
  onCancel,
  loading,
  ckfinderBasePath = '/',
}) {
  const [title, setTitle] = useState(initial?.title || initial?.name || '');
  const [orderIndex, setOrderIndex] = useState(initial?.order_index ?? initial?.order ?? initial?.sort_index ?? 0);
  const [published, setPublished] = useState(!!(initial?.is_published ?? initial?.published ?? true));
  const [parentId, setParentId] = useState(initial?.parent_id ? String(initial.parent_id) : '');
  const [bodyHtml, setBodyHtml] = useState(initial?.body_html || initial?.html_content || initial?.body || '');

  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const [parentQuery, setParentQuery] = useState('');

  useEffect(() => {
    setTitle(initial?.title || initial?.name || '');
    setOrderIndex(initial?.order_index ?? initial?.order ?? initial?.sort_index ?? 0);
    setPublished(!!(initial?.is_published ?? initial?.published ?? true));
    setParentId(initial?.parent_id ? String(initial.parent_id) : '');
    setBodyHtml(initial?.body_html || initial?.html_content || initial?.body || '');
  }, [initial]);

  const parentOptions = useMemo(() => {
    return [{ value: '', label: '— Không có —' }].concat(
      contentsInCategory
        .filter((c) => c.id !== initial?.id)
        .map((c) => ({ value: String(c.id), label: c.title || c.name }))
    );
  }, [contentsInCategory, initial]);

  const filteredParentOptions = useMemo(() => {
    const q = parentQuery.trim().toLowerCase();
    if (!q) return parentOptions;
    return parentOptions.filter((opt) => opt.value === '' || (opt.label || '').toLowerCase().includes(q));
  }, [parentQuery, parentOptions]);

  const validate = () => {
    const e = {};
    const nm = (title || '').trim();
    if (!nm) e.title = 'Tiêu đề bắt buộc';
    else if (nm.length < 3) e.title = 'Tối thiểu 3 ký tự';
    else if (nm.length > 120) e.title = 'Tối đa 120 ký tự';

    const oi = Number(orderIndex);
    if (!Number.isInteger(oi) || oi < 0) e.order_index = 'Order phải là số nguyên ≥ 0';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!moduleId || !categoryId) {
      window.alert('Vui lòng chọn Module và Function trước khi lưu');
      return;
    }
    if (!validate()) return;
    const payload = {
      title: title.trim(),
      category_id: Number(categoryId),
      is_published: !!published,
      parent_id: parentId ? Number(parentId) : null,
      order_index: Number.isInteger(Number(orderIndex)) ? Number(orderIndex) : 0,
      html_content: bodyHtml,
      plain_content: (bodyHtml || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    };
    onSubmit && onSubmit(payload);
  };

  const handleImportDocx = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const { html } = await convertService.docxToHtml(file, { contentId: initial?.id || 'new-content' });
        setBodyHtml(html || '');
      } catch (err) {
        console.error(err);
        window.alert('Convert DOCX thất bại');
      }
    };
    input.click();
  };

  useEffect(() => {
    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div ref={formRef} className="mt-6 p-5 rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Quản lý Content</h3>
      {/* Context info: Module & Category as badges (read-only) */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <span role="img" aria-label="module">📦</span>
          <span>Module:</span>
          <span className="font-semibold truncate max-w-[240px]">{moduleName || '—'}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
          <span role="img" aria-label="category">📂</span>
          <span>Function:</span>
          <span className="font-semibold truncate max-w-[240px]">{categoryName || '—'}</span>
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nhập tiêu đề" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>
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
              className={`w-full border rounded px-3 py-2 ${errors.order_index ? 'border-red-500' : 'border-gray-300'}`}
              min={0}
              step={1}
              inputMode="numeric"
            />
            {errors.order_index && <p className="text-xs text-red-600 mt-1">{errors.order_index}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <div className="flex items-center h-10">
              <Switch checked={published} onChange={setPublished} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent</label>
            <div className="space-y-2">
              <input
                type="text"
                value={parentQuery}
                onChange={(e) => setParentQuery(e.target.value)}
                className="w-full border rounded px-3 py-2 border-gray-300"
                placeholder="Tìm parent..."
              />
              <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full border rounded px-3 py-2 border-gray-300">
                {filteredParentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nội dung</label>
          <div className="mb-2">
            <button type="button" onClick={handleImportDocx} className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm">
              📄 Import DOCX
            </button>
          </div>
          <EditorCK4
            value={bodyHtml}
            onChange={setBodyHtml}
            config={{
              toolbar: [
                { name: 'document', items: ['Source', 'Preview', 'Print', 'Templates'] },
                { name: 'clipboard', items: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord'] },
                { name: 'editing', items: ['Find', 'Replace', 'SelectAll', 'Scayt'] },
                '/',
                { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat', 'CopyFormatting'] },
                { name: 'paragraph', items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'CreateDiv', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
                '/',
                { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                { name: 'colors', items: ['TextColor', 'BGColor'] },
                { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
              ],
              extraPlugins: 'preview,print,templates,pastefromword,find,selectall,scayt,forms,copyformatting,div,justify,bidi,link,smiley,specialchar,pagebreak,iframe,font,colorbutton,colordialog,showblocks,liststyle,table,tabletools',
              // CKFinder ASP.NET endpoints (IIS)
              filebrowserBrowseUrl: `${ckfinderBasePath}ckfinder.html`,
              filebrowserImageBrowseUrl: `${ckfinderBasePath}ckfinder.html?type=Images`,
              // Connector URLs will be derived inside EditorCK4; override via ckfinderConnectorPath if needed
              ckfinderBasePath,
            }}
            height={420}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50" onClick={onCancel} disabled={loading}>Huỷ</button>
          <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={loading}>{loading ? 'Đang lưu...' : (initial?.id ? 'Cập nhật' : 'Thêm mới')}</button>
        </div>
      </form>
    </div>
  );
}
