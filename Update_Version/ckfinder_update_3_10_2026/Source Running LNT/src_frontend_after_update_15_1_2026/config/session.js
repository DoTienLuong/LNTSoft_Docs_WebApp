// // src/services/session.js
// const AT_KEY = "gid_at";
// const U_KEY  = "gid_user";

// export const getAccessToken = () => localStorage.getItem(AT_KEY);
// export const setAccessToken = (at) => {
//   if (at) localStorage.setItem(AT_KEY, at);
//   else localStorage.removeItem(AT_KEY);
// };

// export const getUser = () => {
//   const s = localStorage.getItem(U_KEY);
//   return s ? JSON.parse(s) : null;
// };
// export const setUser = (u) => {
//   if (u) localStorage.setItem(U_KEY, JSON.stringify(u));
//   else localStorage.removeItem(U_KEY);
// };

// export const clearSession = () => {
//   localStorage.removeItem(AT_KEY);
//   localStorage.removeItem(U_KEY);
// };

// src/services/session.js
let AT_MEM = null;   // Chỉ giữ trong RAM
let U_MEM  = null;

export const getAccessToken = () => AT_MEM;
export const setAccessToken = (at) => { AT_MEM = at || null; };

export const getUser = () => U_MEM;
export const setUser = (u) => { U_MEM = u || null; };

export const clearSession = () => { AT_MEM = null; U_MEM = null; };
