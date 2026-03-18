// src/models/categoryModel.js
const {executeQuery} = require('../config/database');

const DEFAULT_CATEGORY_TYPE = 'Work Area';

const resolveCategoryType = (value) => {
  if (value === undefined || value === null || value === '') return DEFAULT_CATEGORY_TYPE;
  return value;
};

const getNextOrderIndex = async (moduleId, categoryType, parentId, excludeId = null) => {
  const query = `
    SELECT ISNULL(MAX(order_index), -1) AS max_order
    FROM categories
    WHERE module_id = ?
      AND category_type = ?
      AND (parent_id = ? OR (parent_id IS NULL AND ? IS NULL))
      ${excludeId ? 'AND id <> ?' : ''}
  `;

  const params = excludeId
    ? [moduleId, categoryType, parentId, parentId, excludeId]
    : [moduleId, categoryType, parentId, parentId];

  const rows = await executeQuery(query, params);
  return (rows[0]?.max_order ?? -1) + 1;
};

const validateParentScope = async (parentId, moduleId, categoryType) => {
  if (!parentId) return;

  const rows = await executeQuery(
    'SELECT id, module_id, category_type FROM categories WHERE id = ?',
    [parentId]
  );

  const parent = rows[0];
  if (!parent) {
    const err = new Error('parent_id not found');
    err.statusCode = 400;
    throw err;
  }

  if (String(parent.module_id) !== String(moduleId)) {
    const err = new Error('parent must belong to the same module');
    err.statusCode = 400;
    throw err;
  }

  if (String(parent.category_type) !== String(categoryType)) {
    const err = new Error('parent must belong to the same category_type');
    err.statusCode = 400;
    throw err;
  }
};
    
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
      c.category_type,
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
    ORDER BY c.category_type ASC, c.parent_id ASC, c.order_index ASC
  `;

  return await executeQuery(query, [moduleId]);
};

const findCategoryById = async (id) => {
    const query = `
    SELECT 
      c.id, 
      c.module_id,
      c.parent_id,
      c.category_type,
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
const createCategory = async ({ module_id, parent_id, title, description, is_active = true, category_type }) => {
  const resolvedCategoryType = resolveCategoryType(category_type);
  const resolvedParentId = parent_id || null;

  await validateParentScope(resolvedParentId, module_id, resolvedCategoryType);
  const order_index = await getNextOrderIndex(module_id, resolvedCategoryType, resolvedParentId);

  const query = `
    INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active, category_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    module_id,
    resolvedParentId,
    title,
    description || null,
    order_index,
    is_active,
    resolvedCategoryType
  ];
  const result = await executeQuery(query, params);
  return result.insertId;
};

// Cập nhật category
const updateCategory = async (id, data) => {
  const existing = await findCategoryById(id);
  if (!existing) return { affectedRows: 0 };

  const nextModuleId = data.module_id !== undefined ? data.module_id : existing.module_id;
  const nextCategoryType = data.category_type !== undefined
    ? resolveCategoryType(data.category_type)
    : existing.category_type;
  const nextParentId = data.parent_id !== undefined ? (data.parent_id || null) : existing.parent_id;

  const isCategoryTypeChanged =
    data.category_type !== undefined &&
    String(nextCategoryType) !== String(existing.category_type);

  // Block changing type when this category already has children,
  // to avoid parent-child type mismatch in the existing tree.
  if (isCategoryTypeChanged) {
    const children = await executeQuery('SELECT TOP 1 id FROM categories WHERE parent_id = ?', [id]);
    if (children.length > 0) {
      const err = new Error('Cannot change category_type when category has child categories');
      err.statusCode = 400;
      throw err;
    }
  }

  await validateParentScope(nextParentId, nextModuleId, nextCategoryType);

  const fields = [];
  const params = [];

  ['module_id', 'parent_id', 'title', 'description', 'is_active', 'category_type'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`); // thêm vào danh sách cột cần update
      if (key === 'parent_id') {
        params.push(data[key] || null);
      } else if (key === 'category_type') {
        params.push(nextCategoryType);
      } else {
        params.push(data[key]);
      }
    }
  });

  if (data.order_index !== undefined) {
    fields.push('order_index = ?');
    params.push(data.order_index);
  } else {
    const scopeChanged =
      String(nextModuleId) !== String(existing.module_id) ||
      String(nextCategoryType) !== String(existing.category_type) ||
      String(nextParentId) !== String(existing.parent_id);

    if (scopeChanged) {
      const nextOrderIndex = await getNextOrderIndex(nextModuleId, nextCategoryType, nextParentId, id);
      fields.push('order_index = ?');
      params.push(nextOrderIndex);
    }
  }

  if (!fields.length) return { affectedRows: 0 };  // nếu không có field nào cần update thì bỏ qua

  const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);
  
  return await executeQuery(query, params);
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