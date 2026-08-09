import axios from "axios";
export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API });

export function authHeader() {
  const t = localStorage.getItem("nb_admin_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}
