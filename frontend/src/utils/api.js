// src/utils/api.js

const API_BASE = import.meta.env.VITE_API_URL;

console.log(API_BASE);

/**
 * API通信を行う共通関数
 * @param {string} path - APIのパス（例：/get-time-records）
 * @param {object} options - 設定オプション
 * @returns {Promise<any>} - レスポンスJSON
 */
export const apiFetch = async (path, options = {}) => {
  const { method = "GET", headers = {}, body = null, auth = true } = options;

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorMessage = "API Error";
    try {
      const err = await res.json();
      errorMessage = err.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return res.json();
};
