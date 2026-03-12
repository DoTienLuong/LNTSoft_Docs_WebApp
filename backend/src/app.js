const express = require('express');
const cors = require('cors');
const path = require('path');

const helmet = require('helmet');

const moduleRoutes = require('./routes/modules');
const categoryRoutes = require('./routes/categories');
const contentRoutes = require('./routes/contents');
const contentImageRoutes = require('./routes/contentImages')
const convertRoutes = require('./routes/convert');
const authUserRoutes = require('./routes/authUser');

const app = express();

// app.use(helmet({ contentSecurityPolicy: false }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // cho phép nhúng ảnh từ origin khác
  crossOriginEmbedderPolicy: false, // tránh chặn nhúng khi dev
}));
// app.use(cors());
app.use(cors({
  origin: ["http://localhost:4001", "http://192.168.232.1:4001", "http://myapp.local", "http://api.myapp.local", "http://lntsoft.local"], // sửa theo port của bạn
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // phục vụ truy cập file tĩnh từ thư mục uploads

// Debug log khi app khởi động
console.log("🚀 Mounting routes...");

app.use('/api/modules', (req, res, next) => {
  console.log("➡️ Hit /api/modules");
  next();
}, moduleRoutes);

app.use('/api/categories', (req, res, next) => {
  console.log("➡️ Hit /api/categories");
  next();
}, categoryRoutes);

app.use('/api/contents', (req, res, next) => {
  console.log("➡️ Hit /api/contents");
  next();
}, contentRoutes);

app.use('/api/images', (req, res, next) => {
  console.log("➡️ Hit /api/images");
  next();
}, contentImageRoutes);

app.use('/api/convert', (req, res, next) => {
  console.log("➡️ Hit /api/convert");
  next();
}, convertRoutes);

app.use('/api/auth', (req, res, next) => {
  console.log("➡️ Hit /api/auth");
  next();
}, authUserRoutes);

module.exports = app;