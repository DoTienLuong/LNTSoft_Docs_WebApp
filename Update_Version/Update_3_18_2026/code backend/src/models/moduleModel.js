const { executeQuery } = require('../config/database');

const findAllModules = async () => {
  const rows = await executeQuery(`
    SELECT 
      moduleID AS id, 
      moduleName AS name,
      icon,
      order_index,
      active AS is_active,
      create_update_at
      FROM modules
      ORDER BY order_index ASC
  `);
  return rows;
};

const findModuleById = async (id) => {
  const rows = await executeQuery(
    `
    SELECT 
      moduleID AS id, 
      moduleName AS name,
      icon,
      order_index,
      active AS is_active,
      create_update_at
      FROM modules
      WHERE moduleID = ?
  `,[id]
  );
  return rows[0];
};

const createModule = async ({ name, icon, order_index = 0, is_active = 1 }) => {
  const result = await executeQuery(
    'INSERT INTO modules (moduleName, icon, order_index, active) VALUES (?, ?, ?, ?)',
    [name, icon, order_index, is_active]
  );
  return result.insertId; // vẫn ổn vì mysql2 trả về object có insertId
};

const updateModule = async (id, data) => {
  const fields = [];
  const params = [];
  const columnMap = {
    name: 'moduleName',
    icon: 'icon',
    order_index: 'order_index',
    is_active: 'active'
  };
  Object.keys(columnMap).forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${columnMap[key]} = ?`);
      params.push(data[key]);
    }
  });

  if (!fields.length) return;
  params.push(id);
  // await executeQuery(`UPDATE modules SET ${fields.join(', ')} WHERE moduleID = ?`, params);
  const result = await executeQuery(`UPDATE modules SET ${fields.join(', ')} WHERE moduleID = ?`, params);
  return result.affectedRows;
};

const removeModule = async (id) => {
  await executeQuery('DELETE FROM modules WHERE moduleID = ?', [id]);
};

module.exports = {
  findAllModules,
  findModuleById,
  createModule,
  updateModule,
  removeModule
};
