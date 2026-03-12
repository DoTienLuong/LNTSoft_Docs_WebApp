import React, { useMemo, useState } from 'react';

export default function Table({
  columns,
  data,
  actions,
  selectable = false,
  onSelectionChange,
  selection = undefined,
  page = 1,
  pageSize = 10,
  onPageChange,
  total: totalProp,
  serverSide = false,
  actionsWidth,
}) {
  const [internalSelection, setInternalSelection] = useState(new Set());
  const selected = selection !== undefined ? new Set(selection) : internalSelection;

  const allChecked = useMemo(() => data.length > 0 && data.every((r) => selected.has(r.id)), [data, selected]);

  const setSelected = (next) => {
    if (selection !== undefined) {
      onSelectionChange && onSelectionChange(Array.from(next));
    } else {
      setInternalSelection(next);
      onSelectionChange && onSelectionChange(Array.from(next));
    }
  };

  const toggleAll = () => {
    if (!selectable) return;
    const next = new Set(selected);
    if (allChecked) {
      next.clear();
    } else {
      data.forEach((r) => next.add(r.id));
    }
    setSelected(next);
  };

  const toggleRow = (id) => {
    if (!selectable) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const renderCell = (col, row) => {
    const value = row[col.key];
    if (col.render) return col.render(value, row);
    return value;
  };

  const total = totalProp ?? data.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const displayRows = serverSide ? data : data.slice(startIndex, endIndex);

  const goTo = (p) => {
    if (!onPageChange) return;
    const next = Math.min(Math.max(1, p), pageCount);
    if (next !== currentPage) onPageChange(next);
  };

  const getPages = () => {
    const pages = [];
    const maxButtons = 7;
    if (pageCount <= maxButtons) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
      return pages;
    }
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(pageCount - 1, currentPage + 1);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < pageCount - 1) pages.push('...');
    pages.push(pageCount);
    return pages;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white divide-y divide-gray-200">
      <div className="overflow-auto">
      <table className="min-w-full w-full table-fixed text-sm">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className="py-3 px-4 pe-0 w-10">
                <div className="flex items-center h-5">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="border-gray-300 rounded-sm text-blue-600" />
                </div>
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase`}
                style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th
                className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase"
                style={actionsWidth ? { width: typeof actionsWidth === 'number' ? `${actionsWidth}px` : actionsWidth } : undefined}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {displayRows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {selectable && (
                <td className="py-3 ps-4 w-10">
                  <div className="flex items-center h-5">
                    <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} className="border-gray-300 rounded-sm text-blue-600" />
                  </div>
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-4 whitespace-nowrap overflow-hidden ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : undefined}
                >
                  {renderCell(col, row)}
                </td>
              ))}
              {actions && (
                <td
                  className="px-6 py-4 whitespace-nowrap text-end"
                  style={actionsWidth ? { width: typeof actionsWidth === 'number' ? `${actionsWidth}px` : actionsWidth } : undefined}
                >
                  <div className="flex gap-2 justify-end">
                    {actions.view && (
                      <button className="px-2 py-1 rounded bg-slate-600 text-white" onClick={() => actions.view(row)}>
                        Xem
                      </button>
                    )}
                    {actions.edit && (
                      <button className="px-2 py-1 rounded bg-blue-600 text-white" onClick={() => actions.edit(row)}>
                        Sửa
                      </button>
                    )}
                    {actions.delete && (
                      <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => actions.delete(row)}>
                        Xoá
                      </button>
                    )}
                    {actions.publish && (
                      <button className="px-2 py-1 rounded bg-green-600 text-white" onClick={() => actions.publish(row)}>
                        Public
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {displayRows.length === 0 && (
            <tr>
              <td className="px-6 py-6 text-center text-gray-500" colSpan={(columns?.length || 0) + (actions ? 1 : 0) + (selectable ? 1 : 0)}>
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {/* Pagination */}
      <div className="py-3 px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-900">{total === 0 ? 0 : startIndex + 1}-{endIndex}</span> of <span className="font-semibold text-gray-900">{total}</span></span>
        <ul className="flex -space-x-px text-sm">
          <li>
            <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1 || !onPageChange} className="flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 font-medium rounded-l-lg px-3 h-9 disabled:opacity-50">Previous</button>
          </li>
          {getPages().map((p, idx) => (
            <li key={idx}>
              {p === '...' ? (
                <span className="flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-300 px-3 h-9 select-none">…</span>
              ) : (
                <button onClick={() => goTo(p)} disabled={!onPageChange} className={`flex items-center justify-center border border-gray-300 w-9 h-9 ${p === currentPage ? 'text-blue-700 bg-blue-50' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'} font-medium`}>
                  {p}
                </button>
              )}
            </li>
          ))}
          <li>
            <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === pageCount || !onPageChange} className="flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 font-medium rounded-r-lg px-3 h-9 disabled:opacity-50">Next</button>
          </li>
        </ul>
      </div>
    </div>
  );
}
