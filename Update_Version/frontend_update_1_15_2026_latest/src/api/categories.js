// api/categories.js

import api from "./client";

export const getCategoriesByModule = (moduleId, includeInactive = true) =>
  api.get(`/categories?module_id=${moduleId}&include_inactive=${includeInactive}`);

export const getCategoryById = (id) => api.get(`/categories/${id}`);

export const createCategory = (data) => api.post("/categories", data);

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);
