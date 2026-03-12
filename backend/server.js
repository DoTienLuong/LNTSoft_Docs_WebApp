require('dotenv').config();  // load .env trước để mọi file khác dùng được
const app = require('./src/app'); // app.js trả về express app


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
})