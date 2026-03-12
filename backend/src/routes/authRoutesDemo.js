const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { signAccess, signRefresh } = require('../middleware/auth');

const router = express.Router();
const REFRESH_COOKIE = 'gid_refresh';

// Đăng ký (dùng để seed nhanh; production thường chỉ admin tạo user)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'customer' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success:false, message:'Missing fields' });
    }
    const exists = await executeQuery(
      'SELECT TOP 1 id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (exists.length) return res.status(409).json({ success:false, message:'Username or email already exists' });

    const hash = await bcrypt.hash(password, 11);
    await executeQuery(
      'INSERT INTO users (username,email,password_hash,role,is_active,token_version) VALUES (?,?,?,?,1,0)',
      [username, email, hash, role]
    );
    res.json({ success:true, message:'Registered' });
  } catch (err) {
    console.error('register err', err);
    res.status(500).json({ success:false, message:'Register failed' });
  }
});

// Đăng nhập: trả access token + set refresh cookie
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success:false, message:'Missing fields' });
    }

    const rows = await executeQuery(
      'SELECT TOP 1 id,username,email,password_hash,role,is_active,token_version FROM users WHERE (username=? OR email=?)',
      [usernameOrEmail, usernameOrEmail]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ success:false, message:'Invalid credentials or user inactive' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ success:false, message:'Invalid credentials' });

    const payload = { id: user.id, username: user.username, role: user.role, token_version: user.token_version };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user.id, token_version: user.token_version });

    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({ success:true, accessToken, user: { id:user.id, username:user.username, role:user.role } });
  } catch (err) {
    console.error('login err', err);
    res.status(500).json({ success:false, message:'Login failed' });
  }
});

// Refresh access token từ cookie httpOnly
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ success:false, message:'Missing refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); // { id, token_version }
    const users = await executeQuery('SELECT id,username,role,is_active,token_version FROM users WHERE id=?', [decoded.id]);
    const user = users[0];
    if (!user || !user.is_active) return res.status(401).json({ success:false, message:'User invalid' });

    // so sánh token_version để thu hồi refresh cũ
    if (decoded.token_version !== user.token_version) {
      return res.status(401).json({ success:false, message:'Refresh token revoked' });
    }

    const accessToken = signAccess({ id:user.id, username:user.username, role:user.role, token_version:user.token_version });
    res.json({ success:true, accessToken });
  } catch (err) {
    console.error('refresh err', err);
    res.status(401).json({ success:false, message:'Invalid refresh token' });
  }
});

// Lấy thông tin phiên hiện tại
const { requireAuth } = require('../middleware/auth');
router.get('/me', requireAuth, async (req, res) => {
  try {
    const rows = await executeQuery('SELECT id,username,email,role,is_active,last_login_at,password_changed_at,token_version FROM users WHERE id=?', [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, user });
  } catch (err) {
    res.status(500).json({ success:false, message:'Failed' });
  }
});

// Đổi mật khẩu (thu hồi refresh cũ bằng cách tăng token_version)
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success:false, message:'Missing fields' });
    }

    const me = req.user; // { id, role, token_version }
    const rows = await executeQuery('SELECT password_hash, token_version FROM users WHERE id=?', [me.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success:false, message:'User not found' });

    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) return res.status(400).json({ success:false, message:'Current password incorrect' });

    const hash = await bcrypt.hash(new_password, 11);
    await executeQuery(
      'UPDATE users SET password_hash=?, token_version=token_version+1, password_changed_at=GETDATE() WHERE id=?',
      [hash, me.id]
    );

    // clear refresh cũ
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });

    // (tuỳ chọn) phát token mới cho phiên hiện tại
    const newVersionRows = await executeQuery('SELECT token_version, role, username FROM users WHERE id=?', [me.id]);
    const v = newVersionRows[0];
    const accessToken = signAccess({ id: me.id, username: v.username, role: v.role, token_version: v.token_version });
    const refreshToken = signRefresh({ id: me.id, token_version: v.token_version });

    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 14*24*60*60*1000, path: '/api/auth'
    });

    res.json({ success:true, message:'Password changed', accessToken });
  } catch (err) {
    console.error('change-password err', err);
    res.status(500).json({ success:false, message:'Change password failed' });
  }
});

// Logout (xóa cookie refresh)
router.post('/logout', (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success:true, message:'Logged out' });
});

module.exports = router;
