const moduleModel = require('../models/moduleModel');

const moduleController = {
  // 🔹 GET /api/modules
  getAll: async (req, res) => {
    try {
      const modules = await moduleModel.findAllModules();
      res.json({
        success: true,
        data: modules,
        total: modules.length
      });
    } catch (err) {
      console.error('Get modules error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve modules'
      });
    }
  },

  // 🔹 GET /api/modules/:id
  getById: async (req, res) => {
    try {
      const moduleItem = await moduleModel.findModuleById(req.params.id);
      if (!moduleItem) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      res.json({ success: true, data: moduleItem });
    } catch (err) {
      console.error('Get module by ID error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve module'
      });
    }
  },

  // 🔹 POST /api/modules
  create: async (req, res) => {
    try {
      const { name, icon, order_index, is_active } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'name is required'
        });
      }

      const id = await moduleModel.createModule({
        name,
        icon,
        order_index,
        is_active
      });

      res.status(201).json({
        success: true,
        data: { id, name, icon, order_index, is_active },
        message: 'Module created successfully'
      });
    } catch (err) {
      console.error('Create module error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create module'
      });
    }
  },

  // 🔹 PUT /api/modules/:id
  update: async (req, res) => {
    try {
      const affectedRows = await moduleModel.updateModule(req.params.id, req.body);

      if (!affectedRows) {
        return res.status(404).json({
          success: false,
          message: 'Module not found or no changes applied'
        });
      }

      const updated = await moduleModel.findModuleById(req.params.id);

      res.json({
        success: true,
        data: updated,
        message: 'Module updated successfully'
      });
    } catch (err) {
      console.error('Update module error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to update module'
      });
    }
  },

  // 🔹 DELETE /api/modules/:id
  remove: async (req, res) => {
    try {
      const moduleItem = await moduleModel.findModuleById(req.params.id);
      if (!moduleItem) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      await moduleModel.removeModule(req.params.id);

      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (err) {
      console.error('Delete module error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to delete module'
      });
    }
  }
};

module.exports = moduleController;
