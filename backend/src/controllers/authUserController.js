// src/controllers/authUserController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
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
} = require('../models/authUserModel');
const { signAccess, signRefresh } = require('../middleware/auth');

const REFRESH_COOKIE = 'gid_refresh';
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 14 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const register = async (req, res) => {
  try {
    const { username, email, password, role = 'customer' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success:false, message:'Missing fields' });
    }
    // Detailed duplicate feedback
    const dupUser = await existsUsername(username);
    const dupEmail = await existsEmail(email);
    if (dupUser || dupEmail) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE',
        message: 'Username or email already exists',
        fields: { username: dupUser ? 'exists' : undefined, email: dupEmail ? 'exists' : undefined }
      });
    }
    const hash = await bcrypt.hash(password, 11);
    await createUser({ username, email, password_hash: hash, role });
    res.json({ success:true, message:'Registered' });
  } catch (err) {
    console.error('register err', err);
    res.status(500).json({ success:false, message:'Register failed' });
  }
};

const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success:false, message:'Missing fields' });
    }
    const user = await findByUsernameOrEmail(usernameOrEmail);
    if (!user || !user.is_active) {
      return res.status(401).json({ success:false, message:'Invalid credentials or user inactive' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ success:false, message:'Invalid credentials' });

    const payload = { id: user.id, username: user.username, role: user.role, token_version: user.token_version };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user.id, token_version: user.token_version });
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);

    await updateLastLogin(user.id);

    res.json({ success:true, accessToken, user: { id:user.id, username:user.username, role:user.role } });
  } catch (err) {
    console.error('login err', err);
    res.status(500).json({ success:false, message:'Login failed' });
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ success:false, message:'Missing refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); // { id, token_version }
    const dbUser = await findById(decoded.id);
    if (!dbUser || !dbUser.is_active) return res.status(401).json({ success:false, message:'User invalid' });
    if (decoded.token_version !== dbUser.token_version) {
      return res.status(401).json({ success:false, message:'Refresh token revoked' });
    }

    const accessToken = signAccess({
      id: dbUser.id, username: dbUser.username, role: dbUser.role, token_version: dbUser.token_version
    });
    res.json({ success:true, accessToken });
  } catch (err) {
    console.error('refresh err', err);
    res.status(401).json({ success:false, message:'Invalid refresh token' });
  }
};

const me = async (req, res) => {
  try {
    const u = await findById(req.user.id);
    if (!u) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, user: u });
  } catch (err) {
    res.status(500).json({ success:false, message:'Failed' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success:false, message:'Missing fields' });
    }
    const me = await findByUsernameOrEmail(req.user.username);
    if (!me) return res.status(404).json({ success:false, message:'User not found' });

    const ok = await bcrypt.compare(current_password, me.password_hash);
    if (!ok) return res.status(400).json({ success:false, message:'Current password incorrect' });

    const newHash = await bcrypt.hash(new_password, 11);
    await updatePasswordAndRevoke(me.id, newHash);

    // tạo bộ token mới
    const v = await getTokenVersionRoleUsername(me.id);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    const accessToken = signAccess({ id: me.id, username: v.username, role: v.role, token_version: v.token_version });
    const refreshToken = signRefresh({ id: me.id, token_version: v.token_version });
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);

    res.json({ success:true, message:'Password changed', accessToken });
  } catch (err) {
    console.error('change-password err', err);
    res.status(500).json({ success:false, message:'Change password failed' });
  }
};

const logout = (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success:true, message:'Logged out' });
};

const adminGetUsers = async (req, res) => {
  try {
    const users = await adminGetAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    console.error('adminGetUsers err', err);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
};

const adminUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, is_active } = req.body;

    // Validation đơn giản cho role
    const allowedRoles = ['admin', 'manager', 'customer'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Duplicate checks (exclude current user id)
    const dupUser = await existsUsernameExclId(id, username);
    const dupEmail = await existsEmailExclId(id, email);
    if (dupUser || dupEmail) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE',
        message: 'Username or email already exists',
        fields: { username: dupUser ? 'exists' : undefined, email: dupEmail ? 'exists' : undefined }
      });
    }

    const data = { username, email, role, is_active };
    const affected = await adminUpdateUser(id, data);

    if (!affected) {
      return res.status(404).json({ success: false, message: 'User not found or nothing to update' });
    }

    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error('adminUpdateUser err', err);
    res.status(500).json({ success: false, message: 'Update user failed' });
  }
}; 

const adminResetPass = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ success: false, message: 'Missing new_password' });
    }

    const hash = await bcrypt.hash(new_password, 11);
    await adminResetUserPassword(id, hash);

    // Lưu ý: không trả password thô ra log, còn expose trong JSON hay không tùy bạn thiết kế UI
    res.json({
      success: true,
      message: 'Password reset successfully. Please provide the new password to the user manually.',
    });
  } catch (err) {
    console.error('adminResetUserPassword err', err);
    res.status(500).json({ success: false, message: 'Reset password failed' });
  }
}

module.exports = { register, login, refresh, me, changePassword, logout, adminGetUsers, adminUpdate, adminResetPass };
