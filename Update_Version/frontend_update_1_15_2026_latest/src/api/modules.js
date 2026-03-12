import api from "./client";

// GET all
export const getModules = () => api.get("/modules");

// GET by ID
export const getModuleById = (id) => api.get(`/modules/${id}`);

// CREATE
export const createModule = (data) => api.post("/modules", data);

// UPDATE
export const updateModule = (id, data) => api.put(`/modules/${id}`, data);

// DELETE
export const deleteModule = (id) => api.delete(`/modules/${id}`);
