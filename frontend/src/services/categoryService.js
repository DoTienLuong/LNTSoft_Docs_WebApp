// services/categoryService.js

import {
  getCategoriesByModule,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

export const categoryService = {
  list: async (moduleId, includeInactive = false) =>
    (await getCategoriesByModule(moduleId, includeInactive)).data.data,
  detail: async (id) => (await getCategoryById(id)).data,
  create: async (data) => (await createCategory(data)).data,
  update: async (id, data) => (await updateCategory(id, data)).data,
  remove: async (id) => (await deleteCategory(id)).data,
};
