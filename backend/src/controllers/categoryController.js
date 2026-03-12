// controllers/categoryController.js

const categoryModel = require('../models/categoryModel');

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
      const { module_id, parent_id, title, description, order_index, is_active } = req.body;

      if (!module_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'module_id and title are required'
        });
      }

      const id = await categoryModel.createCategory({
        module_id,
        parent_id,
        title,
        description,
        order_index,
        is_active
      });

      res.status(201).json({
        success: true,
        data: {
          id,
          module_id,
          parent_id,
          title,
          description,
          order_index,
          is_active
        }
      });
    } catch (err) {
      console.error('Create category error:', err);
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

      await categoryModel.updateCategory(req.params.id, req.body);
      const updated = await categoryModel.findCategoryById(req.params.id);

      res.json({
        success: true,
        data: updated
      });
    } catch (err) {
      console.error('Update category error:', err);
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
