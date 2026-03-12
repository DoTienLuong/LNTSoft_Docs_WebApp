const { executeQuery } = require('../config/database');

const findByUsernameOrEmail = async (usernameOrEmail) => {
  const rows = await executeQuery(
    'SELECT TOP 1 id, username, email, password_hash, role, is_active, token_version FROM users WHERE (username=? OR email=?)',
    [usernameOrEmail, usernameOrEmail]
  );
  return rows[0];
};

const existsUsernameOrEmail = async (username, email) => {
  const rows = await executeQuery(
    'SELECT TOP 1 id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );
  return rows.length > 0;
};

// Check individual fields (helpful for detailed validation)
const existsUsername = async (username) => {
  if (!username) return false;
  const rows = await executeQuery('SELECT TOP 1 id FROM users WHERE username = ?', [username]);
  return rows.length > 0;
};

const existsEmail = async (email) => {
  if (!email) return false;
  const rows = await executeQuery('SELECT TOP 1 id FROM users WHERE email = ?', [email]);
  return rows.length > 0;
};

// Exclude a specific user id when checking duplicates (for updates)
const existsUsernameExclId = async (id, username) => {
  if (!username) return false;
  const rows = await executeQuery('SELECT TOP 1 id FROM users WHERE username = ? AND id <> ?', [username, id]);
  return rows.length > 0;
};

const existsEmailExclId = async (id, email) => {
  if (!email) return false;
  const rows = await executeQuery('SELECT TOP 1 id FROM users WHERE email = ? AND id <> ?', [email, id]);
  return rows.length > 0;
};


const createUser = async ({ username, email, password_hash, role = 'customer' }) => {
  const result = await executeQuery(
    'INSERT INTO users (username,email,password_hash,role,is_active,token_version) VALUES (?,?,?,?,1,0)',
    [username, email, password_hash, role]
  );
  return result.insertId;
};

const findById = async (id) => {
  const rows = await executeQuery(
    'SELECT id, username, email, role, is_active, last_login_at, password_changed_at, token_version FROM users WHERE id=?',
    [id]
  );
  return rows[0];
};

const updateLastLogin = async (id) => {
  await executeQuery('UPDATE users SET last_login_at = GETDATE() WHERE id=?', [id]);
};

const updatePasswordAndRevoke = async (id, newHash) => {
  await executeQuery(
    'UPDATE users SET password_hash=?, token_version=token_version+1, password_changed_at=GETDATE() WHERE id=?',
    [newHash, id]
  );
};

const getTokenVersionRoleUsername = async (id) => {
  const rows = await executeQuery('SELECT token_version, role, username FROM users WHERE id=?', [id]);
  return rows[0];
};

const adminGetAllUsers = async () => {
  const rows = await executeQuery(
    'SELECT id, username, email, role, is_active, last_login_at FROM users ORDER BY last_login_at ASC'
  );
  return rows;
};

const adminUpdateUser = async(id, data) => {
  const fields = [];
  const params = [];
  ['username', 'email', 'role', 'is_active'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  });
  if (!fields.length) return;
  params.push(id);
  const result = await executeQuery(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return result.affectedRows;
};

const adminResetUserPassword = async (id, newHash) => {
  await executeQuery(
    'UPDATE users SET password_hash=?, token_version=token_version+1, password_changed_at=GETDATE() WHERE id=?',
    [newHash, id]
  );
};

module.exports = {
  findByUsernameOrEmail,
  existsUsernameOrEmail,
  existsUsername,
  existsEmail,
  existsUsernameExclId,
  existsEmailExclId,
  createUser,
  findById,
  updateLastLogin,
  updatePasswordAndRevoke,
  getTokenVersionRoleUsername,
  adminGetAllUsers,
  adminUpdateUser,
  adminResetUserPassword
};
