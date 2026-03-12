// src/models/categoryModel.js
const {executeQuery} = require('../config/database');
    
// Lấy tất cả categories theo module_id
const findCategoriesByModuleId = async (moduleId, includeInactive = false) => {
  const whereClause = includeInactive
    ? 'WHERE c.module_id = ?'
    : 'WHERE c.module_id = ? AND c.is_active = 1';

  const query = `
    SELECT 
      c.id, 
      c.module_id,
      c.parent_id,
      c.title,
      c.description,
      c.order_index,
      c.is_active,
      c.create_update_at,
      parent.title AS parent_title,
      m.moduleName AS module_name
    FROM categories c
    JOIN modules m ON c.module_id = m.moduleID
    LEFT JOIN categories parent ON c.parent_id = parent.id
    ${whereClause}
    ORDER BY c.parent_id ASC, c.order_index ASC
  `;

  return await executeQuery(query, [moduleId]);
};

const findCategoryById = async (id) => {
    const query = `
    SELECT 
      c.id, 
      c.module_id,
      c.parent_id,
      c.title,
      c.description,
      c.order_index,
      c.is_active,
      c.create_update_at,
      m.moduleName AS module_name,
      parent.title AS parent_title
    FROM categories c
    JOIN modules m ON c.module_id = m.moduleID
    LEFT JOIN categories parent ON c.parent_id = parent.id
    WHERE c.id = ?
  `;
  const rows = await executeQuery(query, [id]);
  return rows[0];
};

// Tạo category
const createCategory = async ({ module_id, parent_id, title, description, order_index = 0, is_active = true }) => {
  const query = `
    INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    module_id,
    parent_id || null,
    title,
    description || null,
    order_index,
    is_active
  ];
  const result = await executeQuery(query, params);
  return result.insertId;
};

// Cập nhật category
const updateCategory = async (id, data) => {
  const fields = [];
  const params = [];

  ['module_id', 'parent_id', 'title', 'description', 'order_index', 'is_active'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`); // thêm vào danh sách cột cần update
      params.push(data[key]);    // thêm giá trị vào params theo thứ tự
    }
  });

  if (!fields.length) return { affectedRows: 0 };  // nếu không có field nào cần update thì bỏ qua

  const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);
  
  await executeQuery(query, params);
};

// Xoá category
const removeCategory = async(id) => {
    await executeQuery('DELETE FROM categories WHERE id = ?', [id]);
}

// Kiểm tra children
const findChildren = async (id) => {
  return await executeQuery('SELECT id FROM categories WHERE parent_id = ?', [id]);
};

// Kiểm tra contents
const findContents = async (id) => {
  return await executeQuery('SELECT id FROM contents WHERE category_id = ?', [id]);
};

module.exports = {
  findCategoriesByModuleId,
  findCategoryById,
  createCategory,
  updateCategory,
  removeCategory,
  findChildren,
  findContents
};