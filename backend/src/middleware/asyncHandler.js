// src/middleware/asyncHandler.js
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// async controller để không phải try/catch mỗi hàm — lỗi sẽ được truyền cho errorHandler
// usage: router.get('/', asyncHandler(async (req, res, next) => { ... }))