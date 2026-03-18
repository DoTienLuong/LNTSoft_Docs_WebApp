// controllers/categoryController.js

const categoryModel = require('../models/categoryModel');

const ALLOWED_CATEGORY_TYPES = ['Work Area', 'Report', 'Setting'];

// Helper: tổ chức categories thành cây cha – con
const organizeCategories = (categories) => {
  const parents = [];
  const children = [];

  categories.forEach((cat) => {
    if (cat.parent_id === null) {
      parents.push({ ...cat, children: [] });
    } else {
      children.push(cat);
    }
  });

  children.forEach((child) => {
    const parent = parents.find((p) => p.id === child.parent_id);
    if (parent) {
      parent.children.push(child);
    }
  });

  return parents;
};

const categoryController = {
  // ✅ GET /api/categories?module_id=1&include_inactive=true
  getAll: async (req, res) => {
    try {
      const { module_id, include_inactive } = req.query;

      if (!module_id) {
        return res.status(400).json({
          success: false,
          message: 'module_id is required'
        });
      }

      const categories = await categoryModel.findCategoriesByModuleId(
        module_id,
        include_inactive === 'true'
      );

      res.json({
        success: true,
        // data: organizeCategories(categories),
        data: categories,
        total: categories.length
      });
    } catch (err) {
      console.error('Get categories error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories'
      });
    }
  },

  // ✅ GET /api/categories/:id
  getById: async (req, res) => {
    try {
      const category = await categoryModel.findCategoryById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (err) {
      console.error('Get category by ID error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve category'
      });
    }
  },

  // ✅ POST /api/categories
  create: async (req, res) => {
    try {
      const { module_id, parent_id, title, description, is_active, category_type } = req.body;

      if (!module_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'module_id and title are required'
        });
      }

      if (category_type !== undefined && !ALLOWED_CATEGORY_TYPES.includes(category_type)) {
        return res.status(400).json({
          success: false,
          message: 'category_type must be one of: Work Area, Report, Setting'
        });
      }

      const id = await categoryModel.createCategory({
        module_id,
        parent_id: parent_id || null,
        title,
        description,
        is_active,
        category_type
      });

      const created = await categoryModel.findCategoryById(id);

      res.status(201).json({
        success: true,
        data: created
      });
    } catch (err) {
      console.error('Create category error:', err);
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create category'
      });
    }
  },

  // ✅ PUT /api/categories/:id
  update: async (req, res) => {
    try {
      const existing = await categoryModel.findCategoryById(req.params.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (
        req.body.category_type !== undefined &&
        !ALLOWED_CATEGORY_TYPES.includes(req.body.category_type)
      ) {
        return res.status(400).json({
          success: false,
          message: 'category_type must be one of: Work Area, Report, Setting'
        });
      }

      const payload = {
        ...req.body,
        parent_id: req.body.parent_id !== undefined ? (req.body.parent_id || null) : undefined
      };

      await categoryModel.updateCategory(req.params.id, payload);
      const updated = await categoryModel.findCategoryById(req.params.id);

      res.json({
        success: true,
        data: updated
      });
    } catch (err) {
      console.error('Update category error:', err);
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update category'
      });
    }
  },

  // ✅ DELETE /api/categories/:id
  remove: async (req, res) => {
    try {
      const existing = await categoryModel.findCategoryById(req.params.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const children = await categoryModel.findChildren(req.params.id);
      if (children.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with subcategories'
        });
      }

      const contents = await categoryModel.findContents(req.params.id);
      if (contents.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with contents'
        });
      }

      await categoryModel.removeCategory(req.params.id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (err) {
      console.error('Delete category error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }
  }
};

module.exports = categoryController;
